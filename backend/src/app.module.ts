import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { Property } from './modules/properties/entities/property.entity';
import { Inquiry } from './modules/inquiries/entities/inquiry.entity';
import { AdminModule } from './modules/admin/admin.module';
import { CustomerModule } from './modules/customer/customer.module';
import { RealtorModule } from './modules/realtor/realtor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 5432)),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', '1234'),
        database: configService.get<string>('DB_NAME', 'real_estate'),
        entities: [UserEntity, Property, Inquiry],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    RealtorModule,
  ],
})
export class AppModule {}
