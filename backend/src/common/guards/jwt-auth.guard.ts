import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../modules/users/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token.');
    }

    const token = authHeader.split(' ')[1];

    let payload: any;
    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'super_secret_jwt_key_remy_2026',
      );
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    // A valid signature only proves the token was issued while the account
    // was in good standing - it says nothing about right now. Check live
    // ban status on every request so a ban takes effect immediately instead
    // of waiting out the token's multi-day expiry.
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'isBanned'],
    });

    if (!user) {
      throw new UnauthorizedException('Account no longer exists.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Your account has been suspended.');
    }

    request.user = payload;
    return true;
  }
}