import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  CLIENT = 'customer',
  REALTOR = 'realtor',
  ADMIN = 'admin',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ default: false })
  isVerifiedRealtor: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  bannedAt: Date;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  // Realtor-facing profile details, shown on the public "Meet Our Realtors"
  // page once the account is verified. Nullable since customers/admins don't use them.
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  agencyName: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'int', nullable: true })
  yearsExperience: number;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  officeAddress: string;

  // Realtor application materials, submitted at registration and reviewed by
  // an admin before isVerifiedRealtor is flipped to true.
  @Column({ nullable: true })
  cvUrl: string;

  @Column({ type: 'text', nullable: true })
  motivationLetter: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}