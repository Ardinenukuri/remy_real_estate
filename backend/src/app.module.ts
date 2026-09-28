import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { Property } from './modules/properties/entities/property.entity';
import { PropertyView } from './modules/properties/entities/property-view.entity';
import { Category } from './modules/properties/entities/category.entity';
import { Inquiry } from './modules/inquiries/entities/inquiry.entity';
import { Message } from './modules/messages/entities/message.entity';
import { Conversation } from './modules/messages/entities/conversation.entity';
import { Tour } from './modules/tours/entities/tour.entity';
import { SavedProperty } from './modules/saved-properties/entities/saved-property.entity';
import { BlogPost } from './modules/content/entities/blog-post.entity';
import { Faq } from './modules/content/entities/faq.entity';
import { Testimonial } from './modules/content/entities/testimonial.entity';
import { ContactMessage } from './modules/content/entities/contact-message.entity';
import { AdminModule } from './modules/admin/admin.module';
import { CustomerModule } from './modules/customer/customer.module';
import { RealtorModule } from './modules/realtor/realtor.module';
import { ContentModule } from './modules/content/content.module';

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
        entities: [
          UserEntity,
          Property,
          PropertyView,
          Category,
          Inquiry,
          Message,
          Conversation,
          Tour,
          SavedProperty,
          BlogPost,
          Faq,
          Testimonial,
          ContactMessage,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    RealtorModule,
    ContentModule,
  ],
})
export class AppModule {}
