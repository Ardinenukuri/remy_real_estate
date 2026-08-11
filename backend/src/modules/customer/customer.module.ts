import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { UserEntity } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Property]),
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
  controllers: [CustomerController],
  providers: [CustomerService, JwtAuthGuard],
  exports: [CustomerService],
})
export class CustomerModule {}