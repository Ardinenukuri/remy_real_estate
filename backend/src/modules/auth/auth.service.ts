import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from '../../modules/users/dto/register.dto';
import { LoginDto } from '../../modules/users/dto/login.dto';
import { ResetPasswordDto } from '../../modules/users/dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // 1. REGISTER USER
  async register(registerDto: RegisterDto, cvUrl?: string) {
    const { email, password, firstName, lastName, role, phoneNumber, motivationLetter } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const isRealtorApplication = role === UserRole.REALTOR;

    // A realtor application isn't complete without something for the admin
    // to actually review - a CV and a motivation letter are the minimum.
    if (isRealtorApplication && (!cvUrl || !motivationLetter?.trim())) {
      throw new BadRequestException(
        'Realtor applications require both a CV upload and a motivation letter.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = this.userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: role || UserRole.CLIENT,
      phoneNumber,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
      cvUrl: isRealtorApplication ? cvUrl : undefined,
      motivationLetter: isRealtorApplication ? motivationLetter : undefined,
    });

    await this.userRepository.save(newUser);
    await this.mailService.sendVerificationEmail(email, verificationToken);

    if (isRealtorApplication) {
      const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
      const realtorName = `${firstName || ''} ${lastName || ''}`.trim() || email;
      admins.forEach((admin) => {
        this.mailService
          .sendNewRealtorPendingEmail(admin.email, realtorName, email)
          .catch((err) => console.error('Failed to notify admin of new realtor signup:', err));
      });
    }

    return {
      message: isRealtorApplication
        ? 'Registration successful! Please verify your email. Your realtor application (CV and motivation letter) is now pending admin review.'
        : 'Registration successful! Please check your email to verify your account.',
    };
  }

  // 2. VERIFY EMAIL
  async verifyEmail(token: string) {
    // 1. Find user by verification token
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    // 2. Mark account as verified and remove token
    user.isEmailVerified = true;
    user.emailVerificationToken = null;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully.',
    };
  }

  // 3. LOGIN USER (Role included in JWT Payload)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'passwordHash',
        'role',
        'isEmailVerified',
        'isVerifiedRealtor',
        'avatarUrl',
        'isBanned',
        'bannedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Banned Account Guard - checked before anything else so a banned user
    // can't slip through even if their email happens to still be unverified.
    if (user.isBanned) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support if you believe this is a mistake.',
      );
    }

    // Unverified Email Guard
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Your email is not verified. Please check your inbox.');
    }

    // Realtors need a separate admin approval before they can act as a realtor,
    // even once their email is verified - email ownership isn't the same as
    // being a vetted agent.
    if (user.role === UserRole.REALTOR && !user.isVerifiedRealtor) {
      throw new UnauthorizedException(
        'Your realtor account is pending admin approval. You will receive an email once approved.',
      );
    }

    // Generate JWT Token with Role embedded
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role, // role returned to client
        isVerifiedRealtor: user.isVerifiedRealtor,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // 4. FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Return message without leaking user existence
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    await this.userRepository.save(user);
    await this.mailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  // 5. RESET PASSWORD
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExpires'])
      .where('user.resetPasswordToken = :token', { token })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully. You can now log in.' };
  }
}