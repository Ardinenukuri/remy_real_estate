import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ContentController,
  PublicTestimonialsController,
  PublicBlogController,
  PublicFaqController,
} from './content.controller';
import { ContactMessage } from './entities/contact-message.entity';
import { Testimonial } from './entities/testimonial.entity';
import { BlogPost } from './entities/blog-post.entity';
import { Faq } from './entities/faq.entity';
import { UserEntity } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage, Testimonial, BlogPost, Faq, UserEntity])],
  controllers: [ContentController, PublicTestimonialsController, PublicBlogController, PublicFaqController],
  providers: [MailService],
})
export class ContentModule {}
