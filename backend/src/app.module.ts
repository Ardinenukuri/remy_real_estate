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
      useFactory: (configService: ConfigService) => {
        // Most free managed Postgres providers (Neon, Supabase, Render) hand
        // out a single connection string rather than separate host/user/pass
        // vars, and require SSL. DATABASE_URL takes over when set; local dev
        // keeps using the discrete DB_* vars with SSL off.
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const sslEnabled =
          configService.get<string>('DB_SSL', isProduction ? 'true' : 'false') === 'true';

        const connection = databaseUrl
          ? { url: databaseUrl }
          : {
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: Number(configService.get<number>('DB_PORT', 5432)),
              username: configService.get<string>('DB_USERNAME', 'postgres'),
              password: configService.get<string>('DB_PASSWORD', '1234'),
              database: configService.get<string>('DB_NAME', 'real_estate'),
            };

        return {
          type: 'postgres' as const,
          ...connection,
          // Explicit schema instead of relying on the connection's search_path:
          // Neon's pooled endpoint doesn't reliably apply role/database-level
          // search_path defaults to pooled backend connections, which would
          // make every unqualified TypeORM query fail with "relation does not
          // exist". Schema-qualifying here sidesteps that entirely.
          schema: 'public',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
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
          logging: !isProduction,
        };
      },
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    RealtorModule,
    ContentModule,
  ],
})
export class AppModule {}
