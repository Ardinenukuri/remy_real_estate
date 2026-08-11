import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  private readonly blogPosts = [
    {
      id: 'blog-1',
      title: 'How to buy your first home',
      excerpt: 'A practical guide to planning a first purchase.',
      content: 'A quick planning checklist for first-time home buyers.',
      cover_image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
      author: 'Remy Estate Team',
      published: true,
      created_at: new Date().toISOString(),
      slug: 'how-to-buy-your-first-home',
    },
  ];

  private readonly faqs = [
    {
      id: 'faq-1',
      question: 'How can I schedule a viewing?',
      answer: 'Use the inquiry form on the property page and an agent will contact you.',
      category: 'Buying',
      position: 1,
    },
  ];

  private readonly testimonials = [
    {
      id: 'testimonial-1',
      name: 'Jane Carter',
      role: 'Homeowner',
      content: 'The Remy Estate team made the home search easy and transparent.',
      rating: 5,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
  ];

  private readonly messages = [
    {
      id: 'message-1',
      name: 'A Visitor',
      email: 'visitor@example.com',
      subject: 'Looking for listings',
      message: 'I would like to view properties in Nyali.',
      status: 'new',
      created_at: new Date().toISOString(),
    },
  ];

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

  async getAdminProfile() {
    const admin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
      order: { createdAt: 'ASC' },
    });

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
      },
    };
  }

  async updateAdminProfile(payload: any) {
    const admin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
      order: { createdAt: 'ASC' },
    });

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
      },
    };
  }

  async changeAdminPassword(payload: any) {
    const { current_password, new_password } = payload || {};

    if (!current_password || !new_password) {
      throw new NotFoundException('Current and new passwords are required.');
    }

    if (new_password.length < 8) {
      throw new NotFoundException('New password must be at least 8 characters long.');
    }

    const admin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
      order: { createdAt: 'ASC' },
      select: ['id', 'passwordHash'],
    });

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
      Promise.resolve(this.testimonials),
      Promise.resolve(this.messages),
      Promise.resolve(this.blogPosts),
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
      pendingTestimonials: testimonials.filter((t: any) => !t.is_approved).length,
      totalMessages: messages.length,
      newMessages: messages.filter((m: any) => m.status === 'new').length,
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

    user.isVerifiedRealtor = Boolean(isVerified);
    await this.userRepository.save(user);
    return this.serializeUser(user);
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role as UserRole;
    await this.userRepository.save(user);
    return this.serializeUser(user);
  }

  async updateUserBan(id: string, isBanned: boolean) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = Boolean(isBanned);
    user.bannedAt = isBanned ? new Date() : null;
    await this.userRepository.save(user);
    return this.serializeUser(user);
  }

  async getBlogs() {
    return this.blogPosts;
  }

  async createBlog(payload: any) {
    const blog = {
      id: `blog-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    this.blogPosts.push(blog);
    return blog;
  }

  async updateBlog(id: string, payload: any) {
    const target = this.blogPosts.find((b) => b.id === id);
    if (!target) {
      throw new NotFoundException('Blog post not found');
    }
    Object.assign(target, payload);
    return target;
  }

  async deleteBlog(id: string) {
    const index = this.blogPosts.findIndex((b) => b.id === id);
    if (index < 0) {
      throw new NotFoundException('Blog post not found');
    }
    this.blogPosts.splice(index, 1);
    return { deleted: true, id };
  }

  async getFaqs() {
    return this.faqs;
  }

  async createFaq(payload: any) {
    const faq = {
      id: `faq-${Date.now()}`,
      ...payload,
    };
    this.faqs.push(faq);
    return faq;
  }

  async updateFaq(id: string, payload: any) {
    const target = this.faqs.find((f) => f.id === id);
    if (!target) {
      throw new NotFoundException('FAQ not found');
    }
    Object.assign(target, payload);
    return target;
  }

  async deleteFaq(id: string) {
    const index = this.faqs.findIndex((f) => f.id === id);
    if (index < 0) {
      throw new NotFoundException('FAQ not found');
    }
    this.faqs.splice(index, 1);
    return { deleted: true, id };
  }

  async getTestimonials() {
    return this.testimonials;
  }

  async approveTestimonial(id: string, isApproved: boolean) {
    const testimonial = this.testimonials.find((t: any) => t.id === id);
    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }
    testimonial.is_approved = Boolean(isApproved);
    return testimonial;
  }

  async getMessages() {
    return this.messages;
  }

  async updateMessageStatus(id: string, status: string) {
    const message = this.messages.find((m: any) => m.id === id);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.status = status;
    return message;
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
      created_at: user.createdAt,
    };
  }
}