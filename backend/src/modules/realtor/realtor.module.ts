import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtorController } from './realtor.controller';
import { RealtorService } from './realtor.service';
import { UserEntity } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyView } from '../properties/entities/property-view.entity';
import { Category } from '../properties/entities/category.entity';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Tour } from '../tours/entities/tour.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Property, PropertyView, Category, Message, Conversation, Tour]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_key_remy_2026',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '7d'),
        },
      }),
    }),
  ],
  controllers: [RealtorController],
  providers: [RealtorService, JwtAuthGuard, MailService],
  exports: [RealtorService],
})
export class RealtorModule {}