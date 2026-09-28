import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Category } from '../properties/entities/category.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { BlogPost } from '../content/entities/blog-post.entity';
import { Faq } from '../content/entities/faq.entity';
import { Testimonial } from '../content/entities/testimonial.entity';
import { ContactMessage, ContactMessageStatus } from '../content/entities/contact-message.entity';
import { Message, MessageSenderType } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly mailService: MailService,
  ) {}

  private formatCustomer(customer?: UserEntity | null) {
    if (!customer) {
      return { id: null, name: 'Guest', email: '', phone: '', avatar_url: '' };
    }
    return {
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Client',
      email: customer.email,
      phone: customer.phoneNumber || '',
      avatar_url: customer.avatarUrl || '',
    };
  }

  private async serializeConversation(conversation: Conversation, viewerId: string) {
    const unreadCount = await this.messageRepository.count({
      where: { conversationId: conversation.id, recipientId: viewerId, isRead: false },
    });

    return {
      id: conversation.id,
      customer: this.formatCustomer(conversation.customer),
      property_id: conversation.propertyId || undefined,
      property_title: conversation.property?.title || undefined,
      last_message: conversation.lastMessage || '',
      last_updated: conversation.lastMessageAt || conversation.createdAt,
      unread_count: unreadCount,
    };
  }

  // --- Direct messaging with customers (a customer can reach out to "Remy Support" / any admin) ---
  async getConversations(adminId: string) {
    const conversations = await this.conversationRepository.find({
      where: { realtorId: adminId },
      relations: ['customer', 'property'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });

    return {
      conversations: await Promise.all(
        conversations.map((c) => this.serializeConversation(c, adminId)),
      ),
    };
  }

  async getConversationMessages(adminId: string, conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['customer', 'property'],
    });
    if (!conversation || conversation.realtorId !== adminId) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    await this.messageRepository.update(
      { conversationId, recipientId: adminId, isRead: false },
      { isRead: true },
    );

    return {
      conversation: await this.serializeConversation(conversation, adminId),
      messages: messages.map((m) => ({
        id: m.id,
        conversation_id: m.conversationId,
        sender_type: m.senderType,
        content: m.content,
        is_read: m.isRead,
        created_at: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
      })),
    };
  }

  async sendMessage(adminId: string, conversationId: string, content: string) {
    if (!content || !content.trim()) {
      throw new NotFoundException('Message content is required');
    }

    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation || conversation.realtorId !== adminId) {
      throw new NotFoundException('Conversation not found');
    }

    const saved = await this.messageRepository.save(
      this.messageRepository.create({
        conversationId,
        senderType: MessageSenderType.ADMIN,
        senderId: adminId,
        recipientId: conversation.customerId,
        content: content.trim(),
      }),
    );

    conversation.lastMessage = saved.content;
    conversation.lastMessageAt = saved.createdAt;
    await this.conversationRepository.save(conversation);

    return {
      id: saved.id,
      conversation_id: conversationId,
      sender_type: saved.senderType,
      content: saved.content,
      is_read: saved.isRead,
      created_at: saved.createdAt.toISOString(),
    };
  }

  private serializeBlogPost(post: BlogPost) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.coverImage,
      category: post.category,
      author: post.author,
      published: post.published,
      created_at: post.createdAt,
    };
  }

  private slugify(text: string) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async uniqueBlogSlug(title: string, ignoreId?: string) {
    const base = this.slugify(title) || 'post';
    let slug = base;
    let suffix = 1;

    while (true) {
      const existing = await this.blogPostRepository.findOne({ where: { slug } });
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
  }

  private serializeFaq(faq: Faq) {
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      position: faq.position,
    };
  }

  private serializeTestimonial(t: Testimonial) {
    return {
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      is_approved: t.isApproved,
      created_at: t.createdAt,
    };
  }

  private serializeContactMessage(m: ContactMessage) {
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status,
      created_at: m.createdAt,
    };
  }

  async getNotificationCounts(adminId?: string) {
    const [newContactMessages, unreadMessages] = await Promise.all([
      this.contactMessageRepository.count({ where: { status: ContactMessageStatus.NEW } }),
      adminId
        ? this.messageRepository.count({ where: { recipientId: adminId, isRead: false } })
        : Promise.resolve(0),
    ]);
    return { newContactMessages, unreadMessages };
  }

  async getDashboardStats() {
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentProperties = await this.propertyRepository.find({
      relations: ['realtor'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentInquiries = await this.inquiryRepository.find({
      relations: ['property'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const totalUsersCount = await this.userRepository.count();
    const totalPropertiesCount = await this.propertyRepository.count();

    const pendingRealtorsCount = await this.userRepository.count({
      where: {
        role: UserRole.REALTOR,
        isVerifiedRealtor: false,
      },
    });

    const pendingPropertiesCount = await this.propertyRepository.count({
      where: { isApproved: false },
    });

    const viewsQueryResult = await this.propertyRepository
      .createQueryBuilder('property')
      .select('SUM(property.views)', 'totalViews')
      .getRawOne();

    const totalViews = Number(viewsQueryResult?.totalViews || 0);

    return {
      stats: {
        totalUsers: totalUsersCount,
        totalProperties: totalPropertiesCount,
        totalViews,
        pendingRealtors: pendingRealtorsCount,
        pendingProperties: pendingPropertiesCount,
      },
      recentUsers: recentUsers.map((u) => this.serializeUser(u)),
      recentProperties: recentProperties.map((p) => this.serializeProperty(p)),
      recentInquiries,
    };
  }

  async getAdminProperties(
    filter = 'all',
    search = '',
    page = 1,
    limit = 10,
  ) {
    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.realtor', 'realtor')
      .orderBy('property.createdAt', 'DESC');

    if (filter === 'pending') {
      queryBuilder.andWhere('property.isApproved = :isApproved', { isApproved: false });
    } else if (filter === 'approved') {
      queryBuilder.andWhere('property.isApproved = :isApproved', { isApproved: true });
    } else if (filter === 'featured') {
      queryBuilder.andWhere('property.isFeatured = :isFeatured', { isFeatured: true });
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      queryBuilder.andWhere(
        '(property.title ILIKE :term OR property.city ILIKE :term OR property.district ILIKE :term OR property.address ILIKE :term)',
        { term },
      );
    }

    const total = await queryBuilder.getCount();

    const properties = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: properties.map((p) => this.serializeProperty(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPropertyStats() {
    const [total, approved, pending, featured, totalViews] = await Promise.all([
      this.propertyRepository.count(),
      this.propertyRepository.count({ where: { isApproved: true } }),
      this.propertyRepository.count({ where: { isApproved: false } }),
      this.propertyRepository.count({ where: { isFeatured: true } }),
      this.propertyRepository
        .createQueryBuilder('property')
        .select('COALESCE(SUM(property.views), 0)', 'totalViews')
        .getRawOne(),
    ]);

    return {
      total,
      approved,
      pending,
      featured,
      totalViews: Number(totalViews?.totalViews || 0),
    };
  }

  async approveProperty(id: string, isApproved: boolean) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    property.isApproved = isApproved;
    await this.propertyRepository.save(property);
    return this.serializeProperty(property);
  }

  async featureProperty(id: string, isFeatured: boolean) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    property.isFeatured = Boolean(isFeatured);
    await this.propertyRepository.save(property);
    return this.serializeProperty(property);
  }

  async deleteProperty(id: string) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.propertyRepository.remove(property);
    return { deleted: true, id };
  }

  private async resolveAdmin(userId?: string) {
    let admin: UserEntity | null = null;
    if (userId) {
      admin = await this.userRepository.findOne({ where: { id: userId } });
    }
    if (!admin) {
      admin = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
        order: { createdAt: 'ASC' },
      });
    }
    return admin;
  }

  async getAdminProfile(userId?: string) {
    const admin = await this.resolveAdmin(userId);

    if (!admin) {
      return {
        profile: {
          full_name: 'System Administrator',
          email: 'admin@remy.com',
          phone: '+250 788 000 999',
          role_title: 'Platform System Lead',
          access_level: 'Super Admin',
          mfa_enabled: true,
          system_alerts_email: true,
          security_audit_logs: true,
          avatar_url: '',
        },
      };
    }

    return {
      profile: {
        full_name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'System Administrator',
        email: admin.email,
        phone: admin.phoneNumber || '+250 788 000 999',
        role_title: 'Platform System Lead',
        access_level: 'Super Admin',
        mfa_enabled: true,
        system_alerts_email: true,
        security_audit_logs: true,
        avatar_url: admin.avatarUrl || '',
      },
    };
  }

  async updateAdminProfile(payload: any, userId?: string) {
    const admin = await this.resolveAdmin(userId);

    if (!admin) {
      return { message: 'No admin user found to update', profile: payload };
    }

    if (payload?.full_name) {
      const [firstName, ...lastNameParts] = payload.full_name.split(' ');
      admin.firstName = firstName || admin.firstName;
      admin.lastName = lastNameParts.join(' ') || admin.lastName;
    }

    if (payload?.email) {
      admin.email = payload.email;
    }

    if (payload?.phone) {
      admin.phoneNumber = payload.phone;
    }

    if (payload?.avatar_url !== undefined) {
      admin.avatarUrl = payload.avatar_url;
    }

    await this.userRepository.save(admin);

    return {
      message: 'Administrator profile updated successfully',
      profile: {
        full_name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
        email: admin.email,
        phone: admin.phoneNumber,
        role_title: payload?.role_title || 'Platform System Lead',
        access_level: payload?.access_level || 'Super Admin',
        mfa_enabled: payload?.mfa_enabled ?? true,
        system_alerts_email: payload?.system_alerts_email ?? true,
        security_audit_logs: payload?.security_audit_logs ?? true,
        avatar_url: admin.avatarUrl || '',
      },
    };
  }

  async changeAdminPassword(payload: any, userId?: string) {
    const { current_password, new_password } = payload || {};

    if (!current_password || !new_password) {
      throw new NotFoundException('Current and new passwords are required.');
    }

    if (new_password.length < 8) {
      throw new NotFoundException('New password must be at least 8 characters long.');
    }

    let admin: UserEntity | null = null;
    if (userId) {
      admin = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'passwordHash'],
      });
    }
    if (!admin) {
      admin = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
        order: { createdAt: 'ASC' },
        select: ['id', 'passwordHash'],
      });
    }

    if (!admin) {
      throw new NotFoundException('Admin user not found.');
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(current_password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect.');
    }

    admin.passwordHash = await bcrypt.hash(new_password, 10);
    await this.userRepository.save(admin);

    return { message: 'Admin password updated successfully.' };
  }

  async getReports() {
    const [users, properties, inquiries, testimonials, messages, blogPosts] = await Promise.all([
      this.userRepository.find(),
      this.propertyRepository.find({ relations: ['realtor'] }),
      this.inquiryRepository.find(),
      this.testimonialRepository.find(),
      this.contactMessageRepository.find(),
      this.blogPostRepository.find(),
    ]);

    const reportStats = {
      totalUsers: users.length,
      realtors: users.filter((u) => u.role === UserRole.REALTOR).length,
      customers: users.filter((u) => u.role === UserRole.CLIENT).length,
      verifiedRealtors: users.filter((u) => u.role === UserRole.REALTOR && u.isVerifiedRealtor).length,
      pendingRealtors: users.filter((u) => u.role === UserRole.REALTOR && !u.isVerifiedRealtor).length,
      totalProperties: properties.length,
      approvedProperties: properties.filter((p) => p.isApproved).length,
      pendingProperties: properties.filter((p) => !p.isApproved).length,
      totalViews: properties.reduce((acc, p) => acc + Number(p.views || 0), 0),
      totalInquiries: inquiries.length,
      totalAppointments: inquiries.length,
      totalFavorites: 0,
      totalBlogPosts: blogPosts.length,
      totalTestimonials: testimonials.length,
      pendingTestimonials: testimonials.filter((t) => !t.isApproved).length,
      totalMessages: messages.length,
      newMessages: messages.filter((m) => m.status === ContactMessageStatus.NEW).length,
    };

    const topProperties = properties
      .slice()
      .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 5)
      .map((p) => ({
        title: p.title,
        views: Number(p.views || 0),
        price: Number(p.price || 0),
        district: p.district || p.city || 'Unknown',
      }));

    const categoryCounts = new Map<string, number>();
    for (const property of properties) {
      const category = property.category || 'Uncategorized';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }

    const propertiesByCategory = Array.from(categoryCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      stats: reportStats,
      topProperties,
      propertiesByCategory,
    };
  }

  async getUsers(filter = 'all') {
    const where: any = {};

    if (filter === 'customer') {
      where.role = UserRole.CLIENT;
    } else if (filter === 'realtor') {
      where.role = UserRole.REALTOR;
    } else if (filter === 'admin') {
      where.role = UserRole.ADMIN;
    } else if (filter === 'pending') {
      where.role = UserRole.REALTOR;
      where.isVerifiedRealtor = false;
    } else if (filter === 'banned') {
      where.isBanned = true;
    }

    const users = await this.userRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return users.map((u) => this.serializeUser(u));
  }

  async updateUserVerification(id: string, isVerified: boolean) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wasVerified = user.isVerifiedRealtor;
    user.isVerifiedRealtor = Boolean(isVerified);
    await this.userRepository.save(user);

    if (!wasVerified && user.isVerifiedRealtor && user.role === UserRole.REALTOR) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      this.mailService
        .sendRealtorApprovedEmail(user.email, fullName)
        .catch((err) => console.error('Failed to send realtor-approved email:', err));
    }

    return this.serializeUser(user);
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRole = user.role;
    user.role = role as UserRole;
    await this.userRepository.save(user);

    // Send notification email to the user about role change
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    this.mailService
      .sendRoleChangedEmail(user.email, fullName, role, oldRole)
      .catch((err) => console.error('Failed to send role change email:', err));

    return this.serializeUser(user);
  }

  async updateUserBan(id: string, isBanned: boolean, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    user.isBanned = Boolean(isBanned);
    user.bannedAt = isBanned ? new Date() : null;
    await this.userRepository.save(user);

    // Send notification email
    if (isBanned) {
      this.mailService
        .sendAccountBannedEmail(user.email, fullName, reason)
        .catch((err) => console.error('Failed to send ban email:', err));
    } else {
      this.mailService
        .sendAccountUnbannedEmail(user.email, fullName)
        .catch((err) => console.error('Failed to send unban email:', err));
    }

    return this.serializeUser(user);
  }

  async getBlogs() {
    const posts = await this.blogPostRepository.find({ order: { createdAt: 'DESC' } });
    return posts.map((p) => this.serializeBlogPost(p));
  }

  async createBlog(payload: any) {
    const title = payload?.title || 'Untitled Post';
    const slug = payload?.slug || (await this.uniqueBlogSlug(title));

    const post = await this.blogPostRepository.save(
      this.blogPostRepository.create({
        title,
        slug,
        excerpt: payload?.excerpt || '',
        content: payload?.content || '',
        coverImage: payload?.cover_image || '',
        category: payload?.category || '',
        author: payload?.author || 'Remy Real Estates',
        published: Boolean(payload?.published),
      }),
    );
    return this.serializeBlogPost(post);
  }

  async updateBlog(id: string, payload: any) {
    const post = await this.blogPostRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    if (payload?.title !== undefined && payload.title !== post.title) {
      post.title = payload.title;
      post.slug = await this.uniqueBlogSlug(payload.title, post.id);
    }
    if (payload?.excerpt !== undefined) post.excerpt = payload.excerpt;
    if (payload?.content !== undefined) post.content = payload.content;
    if (payload?.cover_image !== undefined) post.coverImage = payload.cover_image;
    if (payload?.category !== undefined) post.category = payload.category;
    if (payload?.author !== undefined) post.author = payload.author;
    if (payload?.published !== undefined) post.published = Boolean(payload.published);

    const saved = await this.blogPostRepository.save(post);
    return this.serializeBlogPost(saved);
  }

  async deleteBlog(id: string) {
    const post = await this.blogPostRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    await this.blogPostRepository.remove(post);
    return { deleted: true, id };
  }

  async getFaqs() {
    const faqs = await this.faqRepository.find({ order: { position: 'ASC' } });
    return faqs.map((f) => this.serializeFaq(f));
  }

  async createFaq(payload: any) {
    const faq = await this.faqRepository.save(
      this.faqRepository.create({
        question: payload?.question || '',
        answer: payload?.answer || '',
        category: payload?.category || 'General',
        position: Number(payload?.position || 0),
      }),
    );
    return this.serializeFaq(faq);
  }

  async updateFaq(id: string, payload: any) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    if (payload?.question !== undefined) faq.question = payload.question;
    if (payload?.answer !== undefined) faq.answer = payload.answer;
    if (payload?.category !== undefined) faq.category = payload.category;
    if (payload?.position !== undefined) faq.position = Number(payload.position || 0);

    const saved = await this.faqRepository.save(faq);
    return this.serializeFaq(saved);
  }

  async deleteFaq(id: string) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    await this.faqRepository.remove(faq);
    return { deleted: true, id };
  }

  async getCategories() {
    const categories = await this.categoryRepository.find({ order: { name: 'ASC' } });
    return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  }

  async createCategory(payload: any) {
    const name = (payload?.name || '').trim();
    if (!name) {
      throw new NotFoundException('Category name is required.');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new NotFoundException('A category with that name already exists.');
    }

    const category = await this.categoryRepository.save(
      this.categoryRepository.create({ name, slug }),
    );
    return { id: category.id, name: category.name, slug: category.slug };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const inUse = await this.propertyRepository.count({ where: { category: category.id } });
    if (inUse > 0) {
      throw new NotFoundException(
        `Cannot delete "${category.name}" - it is used by ${inUse} propert${inUse === 1 ? 'y' : 'ies'}.`,
      );
    }

    await this.categoryRepository.remove(category);
    return { deleted: true, id };
  }

  async getTestimonials() {
    const testimonials = await this.testimonialRepository.find({ order: { createdAt: 'DESC' } });
    return testimonials.map((t) => this.serializeTestimonial(t));
  }

  async approveTestimonial(id: string, isApproved: boolean) {
    const testimonial = await this.testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }
    testimonial.isApproved = Boolean(isApproved);
    const saved = await this.testimonialRepository.save(testimonial);
    return this.serializeTestimonial(saved);
  }

  async getMessages() {
    const messages = await this.contactMessageRepository.find({ order: { createdAt: 'DESC' } });
    return messages.map((m) => this.serializeContactMessage(m));
  }

  async updateMessageStatus(id: string, status: string) {
    const message = await this.contactMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.status = status as ContactMessageStatus;
    const saved = await this.contactMessageRepository.save(message);
    return this.serializeContactMessage(saved);
  }

  private serializeProperty(property: Property) {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      price: Number(property.price || 0),
      type: property.status || property.category || 'house',
      status: property.status,
      location: property.address || property.city || property.district || '',
      city: property.city,
      district: property.district || property.city || '',
      category: property.category || 'Residential',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqFt: property.areaSqFt,
      imageUrls: property.images || [],
      is_approved: Boolean(property.isApproved),
      is_featured: Boolean(property.isFeatured),
      views: Number(property.views || 0),
      created_at: property.createdAt,
      realtor: property.realtor
        ? {
            id: property.realtor.id,
            full_name: `${property.realtor.firstName || ''} ${property.realtor.lastName || ''}`.trim(),
            email: property.realtor.email,
            role: property.realtor.role,
          }
        : null,
    };
  }

  private serializeUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      role: user.role,
      is_verified: Boolean(user.isVerifiedRealtor),
      is_verified_realtor: Boolean(user.isVerifiedRealtor),
      is_banned: Boolean(user.isBanned),
      banned_at: user.bannedAt || null,
      phone: user.phoneNumber,
      company: (user as any).company || null,
      cv_url: user.cvUrl || null,
      motivation_letter: user.motivationLetter || null,
      created_at: user.createdAt,
    };
  }
}