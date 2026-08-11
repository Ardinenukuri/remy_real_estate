import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Column({ type: 'float', nullable: true })
  areaSqFt: number;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  // Foreign Key to Realtor (UserEntity)
  @Column({ nullable: true })
  realtorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'realtorId' })
  realtor: UserEntity;

  // Inverse relationship with Inquiry
  @OneToMany(() => Inquiry, (inquiry) => inquiry.property)
  inquiries: Inquiry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}