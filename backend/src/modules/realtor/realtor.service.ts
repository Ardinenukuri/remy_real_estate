import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { PropertyView } from '../properties/entities/property-view.entity';
import { Category } from '../properties/entities/category.entity';
import { Message, MessageSenderType } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Tour, TourStatus } from '../tours/entities/tour.entity';
import { MailService } from '../mail/mail.service';

const DEFAULT_CATEGORIES = [
  { name: 'Residential', slug: 'residential' },
  { name: 'Commercial', slug: 'commercial' },
  { name: 'Land', slug: 'land' },
  { name: 'Apartment', slug: 'apartment' },
  { name: 'Villa', slug: 'villa' },
];

@Injectable()
export class RealtorService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyView)
    private readonly propertyViewRepository: Repository<PropertyView>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly mailService: MailService,
  ) {}

  private formatCustomer(customer?: UserEntity | null) {
    if (!customer) {
      return { id: null, name: 'Guest Client', email: '', phone: '', avatar_url: '' };
    }
    return {
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Client',
      email: customer.email,
      phone: customer.phoneNumber || '',
      avatar_url: customer.avatarUrl || '',
    };
  }

  private serializeTour(t: Tour) {
    return {
      id: t.id,
      property_id: t.propertyId,
      property: t.property
        ? { id: t.property.id, title: t.property.title, district: t.property.district || t.property.city || '' }
        : undefined,
      client_name: t.customer
        ? `${t.customer.firstName || ''} ${t.customer.lastName || ''}`.trim() || t.clientName
        : t.clientName || 'Guest Client',
      client_email: t.customer?.email || t.clientEmail || '',
      client_phone: t.customer?.phoneNumber || t.clientPhone || '',
      date: t.tourDate,
      time: t.tourTime,
      notes: t.notes || '',
      status: t.status,
      created_at: t.createdAt,
    };
  }

  // --- Appointments (real viewing tours, shared with the customer-side Tour table) ---
  async getAppointments(realtorId?: string) {
    const tours = await this.tourRepository.find({
      where: realtorId ? { realtorId } : {},
      relations: ['property', 'customer'],
      order: { createdAt: 'DESC' },
    });
    return { appointments: tours.map((t) => this.serializeTour(t)) };
  }

  async createAppointment(realtorId: string, payload: any) {
    const { property_id, client_name, client_email, client_phone, date, time, notes } = payload || {};

    const property = property_id
      ? await this.propertyRepository.findOne({ where: { id: property_id } })
      : null;

    if (!property) {
      throw new NotFoundException('Property not found for the given Property ID.');
    }

    const tour = await this.tourRepository.save(
      this.tourRepository.create({
        propertyId: property.id,
        realtorId,
        clientName: client_name || '',
        clientEmail: client_email || '',
        clientPhone: client_phone || '',
        tourDate: date || '',
        tourTime: time || '',
        notes: notes || '',
        status: TourStatus.CONFIRMED,
      }),
    );

    const saved = await this.tourRepository.findOne({
      where: { id: tour.id },
      relations: ['property', 'customer'],
    });

    return this.serializeTour(saved!);
  }

  async updateAppointmentStatus(realtorId: string, id: string, status: string) {
    const tour = await this.tourRepository.findOne({
      where: { id, realtorId },
      relations: ['property', 'customer', 'realtor'],
    });
    if (!tour) {
      throw new NotFoundException('Appointment not found');
    }
    tour.status = status as TourStatus;
    tour.seenByCustomer = false;
    await this.tourRepository.save(tour);

    const customerEmail = tour.customer?.email || tour.clientEmail;
    if (customerEmail) {
      const customerName = tour.customer
        ? `${tour.customer.firstName || ''} ${tour.customer.lastName || ''}`.trim() || tour.clientName || 'there'
        : tour.clientName || 'there';
      this.mailService
        .sendTourStatusEmail(
          customerEmail,
          customerName,
          tour.property?.title || 'your requested property',
          tour.status,
          tour.tourDate,
          tour.tourTime,
        )
        .catch((err) => console.error('Failed to send tour-status email to customer:', err));
    }

    return this.serializeTour(tour);
  }

  async getNotificationCounts(realtorId?: string) {
    if (!realtorId) {
      return { pendingAppointments: 0, unreadMessages: 0 };
    }

    const [pendingAppointments, unreadMessages] = await Promise.all([
      this.tourRepository.count({ where: { realtorId, status: TourStatus.PENDING } }),
      this.messageRepository.count({ where: { recipientId: realtorId, isRead: false } }),
    ]);

    return { pendingAppointments, unreadMessages };
  }

  // --- Conversations (real, bidirectional messaging with customers) ---
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

  async getConversations(realtorId: string) {
    const conversations = await this.conversationRepository.find({
      where: { realtorId },
      relations: ['customer', 'property'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });

    return {
      conversations: await Promise.all(
        conversations.map((c) => this.serializeConversation(c, realtorId)),
      ),
    };
  }

  async getConversationMessages(realtorId: string, conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['customer', 'property'],
    });
    if (!conversation || conversation.realtorId !== realtorId) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    await this.messageRepository.update(
      { conversationId, recipientId: realtorId, isRead: false },
      { isRead: true },
    );

    return {
      conversation: await this.serializeConversation(conversation, realtorId),
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

  async sendMessage(realtorId: string, conversationId: string, content: string) {
    if (!content || !content.trim()) {
      throw new NotFoundException('Message content is required');
    }

    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation || conversation.realtorId !== realtorId) {
      throw new NotFoundException('Conversation not found');
    }

    const saved = await this.messageRepository.save(
      this.messageRepository.create({
        conversationId,
        senderType: MessageSenderType.REALTOR,
        senderId: realtorId,
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

  async getCategories() {
    const count = await this.categoryRepository.count();
    if (count === 0) {
      // First run: seed the default set once so listing forms always have
      // options, without needing a separate migration/seed script.
      await this.categoryRepository.save(
        DEFAULT_CATEGORIES.map((c) => this.categoryRepository.create(c)),
      );
    }

    const categories = await this.categoryRepository.find({ order: { name: 'ASC' } });
    return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  }

  async createCategory(payload: any) {
    const name = payload?.name || 'New Category';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const category = await this.categoryRepository.save(
      this.categoryRepository.create({ name, slug }),
    );
    return { id: category.id, name: category.name, slug: category.slug };
  }

  async getDashboard(realtorId?: string) {
    const propertyWhere = realtorId ? { realtorId } : {};

    const [properties, tours, unreadMessages] = await Promise.all([
      this.propertyRepository.find({ where: propertyWhere, order: { createdAt: 'DESC' } }),
      realtorId
        ? this.tourRepository.find({
            where: { realtorId },
            relations: ['property', 'customer'],
            order: { createdAt: 'DESC' },
          })
        : Promise.resolve([]),
      realtorId
        ? this.messageRepository.count({ where: { recipientId: realtorId, isRead: false } })
        : Promise.resolve(0),
    ]);

    const totalViews = properties.reduce((acc, p) => acc + Number(p.views || 0), 0);
    const activeListings = properties.filter((p) => p.isApproved).length;
    const pendingAppointments = tours.filter(
      (t) => t.status === TourStatus.PENDING || t.status === TourStatus.CONFIRMED,
    );

    return {
      stats: {
        totalProperties: properties.length,
        activeListings,
        totalViews,
        totalAppointments: tours.length,
        pendingAppointments: pendingAppointments.length,
        unreadMessages,
      },
      recentListings: properties.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        location: p.address || p.district || p.city || '',
        price: Number(p.price || 0),
        is_approved: p.isApproved,
        views: Number(p.views || 0),
        images: p.images || [],
      })),
      recentAppointments: pendingAppointments.slice(0, 5).map((t) => this.serializeTour(t)),
    };
  }

  // Public "Meet Our Realtors" directory - only realtors an admin has verified,
  // and who aren't banned, are shown to site visitors.
  async getPublicDirectory() {
    const realtors = await this.userRepository.find({
      where: { role: UserRole.REALTOR, isVerifiedRealtor: true, isBanned: false },
      order: { createdAt: 'ASC' },
    });

    const withListingCounts = await Promise.all(
      realtors.map(async (r) => {
        const activeListings = await this.propertyRepository.count({
          where: { realtorId: r.id, isApproved: true },
        });

        return {
          id: r.id,
          name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Realtor Agent',
          avatar_url: r.avatarUrl || '',
          bio: r.bio || '',
          specialization: r.specialization || '',
          agency_name: r.agencyName || '',
          years_experience: r.yearsExperience || 0,
          office_address: r.officeAddress || '',
          phone: r.phoneNumber || '',
          email: r.email,
          active_listings: activeListings,
        };
      }),
    );

    return { realtors: withListingCounts };
  }

  async getProperties(query: any = {}) {
    const qb = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.realtor', 'realtor')
      .orderBy('property.createdAt', 'DESC');

    if (query?.realtor_id) {
      // Realtor viewing their own listings: show all statuses, approved or not.
      qb.andWhere('property.realtorId = :realtorId', { realtorId: query.realtor_id });
    } else {
      // Public / customer-facing views: only admin-approved (published) properties.
      qb.andWhere('property.isApproved = :isApproved', { isApproved: true });
    }

    const properties = await qb.getMany();
    return properties.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price || 0),
      district: p.district || p.city || '',
      address: p.address || p.city || '',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area_sqm: p.areaSqFt || 0,
      currency: 'RWF',
      listing_type: p.status === 'RENTED' ? 'rent' : 'sale',
      category_id: p.category || '',
      amenities: [],
      images: p.images || [],
      status: p.status,
      is_approved: p.isApproved,
      is_featured: Boolean(p.isFeatured),
      created_at: p.createdAt,
      realtor: p.realtor
        ? {
            id: p.realtor.id,
            name: `${p.realtor.firstName || ''} ${p.realtor.lastName || ''}`.trim() || 'Realtor Agent',
            avatar_url: p.realtor.avatarUrl || '',
          }
        : null,
    }));
  }

  async getPropertyById(id: string, viewerId?: string) {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['realtor'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Only count this as a "view" when it's not the realtor previewing/editing
    // their own listing - otherwise every edit session would inflate the count.
    if (viewerId !== property.realtorId) {
      await this.propertyViewRepository.save(
        this.propertyViewRepository.create({ propertyId: property.id, viewerId: viewerId || null }),
      );
      await this.propertyRepository.increment({ id: property.id }, 'views', 1);
    }

    return {
      property: {
        id: property.id,
        title: property.title,
        description: property.description,
        price: Number(property.price || 0),
        district: property.district || property.city || '',
        address: property.address || property.city || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqm: property.areaSqFt || 0,
        currency: 'RWF',
        listing_type: property.status === 'RENTED' ? 'rent' : 'sale',
        category_id: property.category || '',
        images: property.images || [],
        amenities: property.amenities || [],
        status: property.status,
        is_approved: property.isApproved,
        created_at: property.createdAt,
        latitude: property.latitude,
        longitude: property.longitude,
        realtor: property.realtor
          ? {
              name: `${property.realtor.firstName || ''} ${property.realtor.lastName || ''}`.trim() || 'Realtor Agent',
              phone: property.realtor.phoneNumber || '+250 788 000 000',
              email: property.realtor.email,
              avatar_url: property.realtor.avatarUrl || '',
            }
          : {
              name: 'Remy Real Estate',
              phone: '+250 788 000 000',
              email: 'info@remy.com',
              avatar_url: '',
            },
      },
    };
  }

  async updateProperty(id: string, payload: any) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (payload?.title !== undefined) property.title = payload.title;
    if (payload?.description !== undefined) property.description = payload.description;
    if (payload?.price !== undefined) property.price = Number(payload.price || 0);
    if (payload?.address !== undefined) property.address = payload.address;
    if (payload?.district !== undefined) {
      property.district = payload.district;
      property.city = payload.district;
    }
    if (payload?.category_id !== undefined) property.category = payload.category_id;
    if (payload?.bedrooms !== undefined) property.bedrooms = Number(payload.bedrooms || 0);
    if (payload?.bathrooms !== undefined) property.bathrooms = Number(payload.bathrooms || 0);
    if (payload?.size !== undefined) property.areaSqFt = Number(payload.size || 0);
    if (payload?.images !== undefined) property.images = payload.images;
    if (payload?.latitude !== undefined) property.latitude = payload.latitude !== null ? Number(payload.latitude) : null;
    if (payload?.longitude !== undefined) property.longitude = payload.longitude !== null ? Number(payload.longitude) : null;
    if (payload?.listing_type !== undefined) {
      property.status = payload.listing_type === 'rent' ? PropertyStatus.RENTED : PropertyStatus.AVAILABLE;
    }

    const saved = await this.propertyRepository.save(property);
    return {
      id: saved.id,
      title: saved.title,
      district: saved.district,
      message: 'Property updated successfully',
    };
  }

  async deleteProperty(id: string) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    await this.propertyRepository.remove(property);
    return { deleted: true, id };
  }

  async createProperty(payload: any) {
    const property = this.propertyRepository.create({
      title: payload?.title || 'Untitled Property',
      description: payload?.description || '',
      price: Number(payload?.price || 0),
      address: payload?.address || '',
      city: payload?.district || '',
      district: payload?.district || '',
      category: payload?.category_id || payload?.category || '',
      bedrooms: Number(payload?.bedrooms || 0),
      bathrooms: Number(payload?.bathrooms || 0),
      areaSqFt: Number(payload?.size || 0),
      images: payload?.images || [],
      status: payload?.listing_type === 'rent' ? PropertyStatus.RENTED : PropertyStatus.AVAILABLE,
      isApproved: false,
      views: 0,
      realtorId: payload?.realtor_id || null,
      latitude: payload?.latitude !== undefined && payload.latitude !== null ? Number(payload.latitude) : null,
      longitude: payload?.longitude !== undefined && payload.longitude !== null ? Number(payload.longitude) : null,
    });
    const saved = await this.propertyRepository.save(property);
    return {
      id: saved.id,
      title: saved.title,
      district: saved.district,
      created_at: saved.createdAt,
      message: 'Property created successfully',
    };
  }

  async getAnalytics(realtorId?: string, range = '30d') {
    const rangeDays: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = rangeDays[range] || 30;
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousCutoff = new Date(cutoff.getTime() - days * 24 * 60 * 60 * 1000);

    const propertyIds = (
      await this.propertyRepository.find({
        where: realtorId ? { realtorId } : {},
        select: ['id'],
      })
    ).map((p) => p.id);

    const pct = (current: number, previous: number) => {
      if (previous <= 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    if (propertyIds.length === 0) {
      return {
        overview: {
          totalViews: 0,
          viewsTrend: 0,
          totalMessages: 0,
          messagesTrend: 0,
          totalBookings: 0,
          bookingsTrend: 0,
          conversionRate: 0,
          conversionTrend: 0,
        },
        topProperties: [],
        monthlyViews: [],
      };
    }

    const countViews = (from: Date, to: Date) =>
      this.propertyViewRepository
        .createQueryBuilder('v')
        .where('v.propertyId IN (:...propertyIds)', { propertyIds })
        .andWhere('v.createdAt >= :from AND v.createdAt < :to', { from, to })
        .getCount();

    const countMessages = (from: Date, to: Date) =>
      realtorId
        ? this.messageRepository
            .createQueryBuilder('m')
            .where('m.recipientId = :realtorId', { realtorId })
            .andWhere('m.createdAt >= :from AND m.createdAt < :to', { from, to })
            .getCount()
        : Promise.resolve(0);

    const countBookings = (from: Date, to: Date) =>
      realtorId
        ? this.tourRepository
            .createQueryBuilder('t')
            .where('t.realtorId = :realtorId', { realtorId })
            .andWhere('t.createdAt >= :from AND t.createdAt < :to', { from, to })
            .getCount()
        : Promise.resolve(0);

    const [totalViews, previousViews, totalMessages, previousMessages, totalBookings, previousBookings] =
      await Promise.all([
        countViews(cutoff, now),
        countViews(previousCutoff, cutoff),
        countMessages(cutoff, now),
        countMessages(previousCutoff, cutoff),
        countBookings(cutoff, now),
        countBookings(previousCutoff, cutoff),
      ]);

    const conversionRate = totalViews > 0 ? Math.round((totalBookings / totalViews) * 1000) / 10 : 0;
    const previousConversionRate =
      previousViews > 0 ? Math.round((previousBookings / previousViews) * 1000) / 10 : 0;

    // Top performing listings within the selected range
    const topViewRows = await this.propertyViewRepository
      .createQueryBuilder('v')
      .select('v.propertyId', 'propertyId')
      .addSelect('COUNT(*)', 'viewCount')
      .where('v.propertyId IN (:...propertyIds)', { propertyIds })
      .andWhere('v.createdAt >= :from AND v.createdAt < :to', { from: cutoff, to: now })
      .groupBy('v.propertyId')
      .orderBy('"viewCount"', 'DESC')
      .limit(5)
      .getRawMany();

    const topProperties = await Promise.all(
      topViewRows.map(async (row) => {
        const property = await this.propertyRepository.findOne({ where: { id: row.propertyId } });
        const bookingCount = await this.tourRepository
          .createQueryBuilder('t')
          .where('t.propertyId = :propertyId', { propertyId: row.propertyId })
          .andWhere('t.createdAt >= :from AND t.createdAt < :to', { from: cutoff, to: now })
          .getCount();
        return {
          id: row.propertyId,
          title: property?.title || 'Property',
          views: Number(row.viewCount),
          bookings: bookingCount,
          price: Number(property?.price || 0),
        };
      }),
    );

    // Monthly trend for the last 6 calendar months, regardless of the selected range
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyViewRows = await this.propertyViewRepository
      .createQueryBuilder('v')
      .select("to_char(date_trunc('month', v.createdAt), 'Mon')", 'month')
      .addSelect("date_trunc('month', v.createdAt)", 'monthStart')
      .addSelect('COUNT(*)', 'count')
      .where('v.propertyId IN (:...propertyIds)', { propertyIds })
      .andWhere('v.createdAt >= :from', { from: sixMonthsAgo })
      .groupBy("date_trunc('month', v.createdAt)")
      .orderBy("date_trunc('month', v.createdAt)", 'ASC')
      .getRawMany();

    const monthlyMessageRows = realtorId
      ? await this.messageRepository
          .createQueryBuilder('m')
          .select("date_trunc('month', m.createdAt)", 'monthStart')
          .addSelect('COUNT(*)', 'count')
          .where('m.recipientId = :realtorId', { realtorId })
          .andWhere('m.createdAt >= :from', { from: sixMonthsAgo })
          .groupBy("date_trunc('month', m.createdAt)")
          .getRawMany()
      : [];

    const messagesByMonth = new Map<string, number>(
      monthlyMessageRows.map((r) => [new Date(r.monthStart).toISOString(), Number(r.count)]),
    );

    const monthlyViews = monthlyViewRows.map((r) => ({
      month: r.month,
      views: Number(r.count),
      messages: messagesByMonth.get(new Date(r.monthStart).toISOString()) || 0,
    }));

    return {
      overview: {
        totalViews,
        viewsTrend: pct(totalViews, previousViews),
        totalMessages,
        messagesTrend: pct(totalMessages, previousMessages),
        totalBookings,
        bookingsTrend: pct(totalBookings, previousBookings),
        conversionRate,
        conversionTrend: Math.round((conversionRate - previousConversionRate) * 10) / 10,
      },
      topProperties,
      monthlyViews,
    };
  }

  async getProfile(userId?: string) {
    let user: UserEntity | null = null;

    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { role: UserRole.REALTOR },
        order: { createdAt: 'ASC' },
      });
    }

    if (!user) {
      return {
        profile: {
          full_name: 'Realtor Agent',
          email: '',
          phone: '',
          agency_name: '',
          license_number: '',
          years_experience: 0,
          bio: '',
          specialization: '',
          office_address: '',
          is_verified: false,
          avatar_url: '',
        },
      };
    }

    return {
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Realtor Agent',
        email: user.email,
        phone: user.phoneNumber || '',
        agency_name: user.agencyName || '',
        license_number: user.licenseNumber || '',
        years_experience: user.yearsExperience || 0,
        bio: user.bio || '',
        specialization: user.specialization || '',
        office_address: user.officeAddress || '',
        is_verified: Boolean(user.isVerifiedRealtor),
        avatar_url: user.avatarUrl || '',
      },
    };
  }

  async updateProfile(payload: any, userId?: string) {
    let user: UserEntity | null = null;

    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { role: UserRole.REALTOR },
        order: { createdAt: 'ASC' },
      });
    }

    if (!user) {
      return { message: 'No realtor user found to update', profile: payload };
    }

    if (payload?.full_name) {
      const [firstName, ...lastNameParts] = payload.full_name.split(' ');
      user.firstName = firstName || user.firstName;
      user.lastName = lastNameParts.join(' ') || user.lastName;
    }

    if (payload?.email) {
      user.email = payload.email;
    }

    if (payload?.phone) {
      user.phoneNumber = payload.phone;
    }

    if (payload?.avatar_url !== undefined) {
      user.avatarUrl = payload.avatar_url;
    }

    if (payload?.agency_name !== undefined) user.agencyName = payload.agency_name;
    if (payload?.license_number !== undefined) user.licenseNumber = payload.license_number;
    if (payload?.years_experience !== undefined) user.yearsExperience = Number(payload.years_experience) || 0;
    if (payload?.bio !== undefined) user.bio = payload.bio;
    if (payload?.specialization !== undefined) user.specialization = payload.specialization;
    if (payload?.office_address !== undefined) user.officeAddress = payload.office_address;

    await this.userRepository.save(user);

    return {
      message: 'Realtor profile updated successfully',
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phoneNumber,
        agency_name: user.agencyName || '',
        license_number: user.licenseNumber || '',
        years_experience: user.yearsExperience || 0,
        bio: user.bio || '',
        specialization: user.specialization || '',
        office_address: user.officeAddress || '',
        is_verified: Boolean(user.isVerifiedRealtor),
        avatar_url: user.avatarUrl || '',
      },
    };
  }

  async changePassword(payload: any, userId?: string) {
    const { current_password, new_password } = payload || {};

    if (!current_password || !new_password) {
      throw new NotFoundException('Current and new passwords are required.');
    }

    if (new_password.length < 6) {
      throw new NotFoundException('New password must be at least 6 characters long.');
    }

    let user: UserEntity | null = null;

    if (userId) {
      user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'passwordHash'],
      });
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { role: UserRole.REALTOR },
        order: { createdAt: 'ASC' },
        select: ['id', 'passwordHash'],
      });
    }

    if (!user) {
      throw new NotFoundException('Realtor user not found.');
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(current_password, user.passwordHash);
    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect.');
    }

    user.passwordHash = await bcrypt.hash(new_password, 10);
    await this.userRepository.save(user);

    return { message: 'Password updated successfully.' };
  }
}