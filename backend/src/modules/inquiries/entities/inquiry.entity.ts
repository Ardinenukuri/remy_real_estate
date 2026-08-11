import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum InquiryStatus {
  PENDING = 'PENDING',
  READ = 'READ',
  RESPONDED = 'RESPONDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  // Foreign Key to Property
  @Column()
  propertyId: string;

  @ManyToOne(() => Property, (property) => property.inquiries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  // Foreign Key to User (Client submitter, optional for guest inquiries)
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}