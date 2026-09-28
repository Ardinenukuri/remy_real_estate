import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { Testimonial } from './entities/testimonial.entity';
import { BlogPost } from './entities/blog-post.entity';
import { Faq } from './entities/faq.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Controller('contact')
export class ContentController {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  // Public: anyone can submit the site "Contact Us" form, no auth required.
  @Post()
  async submit(@Body() body: any) {
    const { name, email, subject, message } = body || {};

    if (!name || !email || !message) {
      return { success: false, error: 'Name, email, and message are required.' };
    }

    const saved = await this.contactMessageRepository.save(
      this.contactMessageRepository.create({
        name,
        email,
        subject: subject || undefined,
        message,
      }),
    );

    const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
    admins.forEach((admin) => {
      this.mailService
        .sendNewContactMessageEmail(admin.email, name, email, subject || 'General Inquiry', message)
        .catch((err) => console.error('Failed to notify admin of new contact message:', err));
    });

    return { success: true, id: saved.id, message: 'Your message has been sent. We will get back to you soon.' };
  }
}

@Controller('testimonials')
export class PublicTestimonialsController {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  // Public: the homepage only ever shows testimonials an admin has approved.
  @Get()
  async getApprovedTestimonials() {
    const testimonials = await this.testimonialRepository.find({
      where: { isApproved: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      created_at: t.createdAt,
    }));
  }
}

@Controller('blog')
export class PublicBlogController {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
  ) {}

  private serialize(post: BlogPost) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.coverImage,
      category: post.category,
      author: post.author,
      created_at: post.createdAt,
    };
  }

  // Public: only posts an admin has published are ever visible on the blog.
  @Get()
  async getPublishedPosts() {
    const posts = await this.blogPostRepository.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
    return posts.map((p) => this.serialize(p));
  }

  @Get(':slug')
  async getPostBySlug(@Param('slug') slug: string) {
    const post = await this.blogPostRepository.findOne({ where: { slug, published: true } });
    if (!post) {
      throw new NotFoundException('Article not found');
    }
    return this.serialize(post);
  }
}

@Controller('faqs')
export class PublicFaqController {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  // Public: the FAQ page.
  @Get()
  async getFaqs() {
    const faqs = await this.faqRepository.find({ order: { position: 'ASC' } });
    return faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      position: f.position,
    }));
  }
}
