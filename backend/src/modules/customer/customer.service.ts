import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyView } from '../properties/entities/property-view.entity';
import { Message, MessageSenderType } from '../messages/entities/message.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { SavedProperty } from '../saved-properties/entities/saved-property.entity';
import { Tour, TourStatus } from '../tours/entities/tour.entity';
import { Testimonial } from '../content/entities/testimonial.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyView)
    private readonly propertyViewRepository: Repository<PropertyView>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(SavedProperty)
    private readonly savedPropertyRepository: Repository<SavedProperty>,
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly mailService: MailService,
  ) {}

  private formatRealtor(realtor?: UserEntity | null) {
    if (!realtor) {
      return {
        id: null,
        name: 'Remy Real Estate',
        phone: '+250 788 000 000',
        email: 'info@remy.com',
        avatar_url: '',
      };
    }
    return {
      id: realtor.id,
      name: `${realtor.firstName || ''} ${realtor.lastName || ''}`.trim() || 'Realtor Agent',
      phone: realtor.phoneNumber || '+250 788 000 000',
      email: realtor.email,
      avatar_url: realtor.avatarUrl || '',
    };
  }

  async getExploreProperties(userId?: string) {
    const dbProperties = await this.propertyRepository.find({
      where: { isApproved: true },
      relations: ['realtor'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const savedPropertyIds = userId
      ? new Set(
          (
            await this.savedPropertyRepository.find({ where: { userId } })
          ).map((s) => s.propertyId),
        )
      : new Set<string>();

    const properties = dbProperties.map((p) => ({
      id: p.id,
      title: p.title,
      district: p.district || p.city || '',
      address: p.address || p.city || '',
      price: Number(p.price || 0),
      type: p.status === 'RENTED' ? 'rent' : 'sale',
      beds: p.bedrooms,
      baths: p.bathrooms,
      area_sqm: p.areaSqFt || 0,
      image_url: p.images?.[0] || '',
      is_saved: savedPropertyIds.has(p.id),
    }));

    return { properties };
  }

  async getDashboard(userId?: string) {
    const [totalProperties, totalUsers] = await Promise.all([
      this.propertyRepository.count(),
      this.userRepository.count(),
    ]);

    const savedProperties = userId
      ? await this.savedPropertyRepository.find({
          where: { userId },
          relations: ['property'],
          order: { createdAt: 'DESC' },
        })
      : [];

    const tours = userId
      ? await this.tourRepository.find({
          where: { customerId: userId },
          relations: ['property', 'realtor'],
          order: { createdAt: 'DESC' },
        })
      : [];

    const unreadMessagesCount = userId
      ? await this.messageRepository.count({ where: { recipientId: userId, isRead: false } })
      : 0;

    const upcomingTours = tours.filter(
      (t) => t.status === TourStatus.CONFIRMED || t.status === TourStatus.PENDING,
    );

    return {
      stats: {
        savedPropertiesCount: savedProperties.length,
        upcomingToursCount: upcomingTours.length,
        unreadMessagesCount,
        totalProperties,
        totalUsers,
      },
      recentSaved: savedProperties.slice(0, 3).map((s) => ({
        id: s.property?.id || s.propertyId,
        title: s.property?.title || 'Property',
        district: s.property?.district || s.property?.city || '',
        price: Number(s.property?.price || 0),
        beds: s.property?.bedrooms,
        baths: s.property?.bathrooms,
      })),
      upcomingTours: upcomingTours.slice(0, 3).map((t) => ({
        id: t.id,
        property_title: t.property?.title || 'Property Viewing',
        district: t.property?.district || t.property?.city || '',
        date: t.tourDate,
        time: t.tourTime,
        status: t.status,
        realtor_name: this.formatRealtor(t.realtor).name,
      })),
    };
  }

  async getPropertyDetails(id: string, viewerId?: string) {
    const dbProperty = await this.propertyRepository.findOne({
      where: { id },
      relations: ['realtor'],
    });

    if (!dbProperty) {
      throw new NotFoundException('Property not found');
    }

    // Every customer-facing detail view is a genuine "someone looked at this
    // listing" event, so log it and bump the running counter.
    await this.propertyViewRepository.save(
      this.propertyViewRepository.create({ propertyId: dbProperty.id, viewerId: viewerId || null }),
    );
    await this.propertyRepository.increment({ id: dbProperty.id }, 'views', 1);

    return {
      property: {
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description || 'No description available.',
        price: Number(dbProperty.price || 0),
        currency: 'RWF',
        type: dbProperty.status === 'RENTED' ? 'rent' : 'sale',
        district: dbProperty.district || dbProperty.city || '',
        address: dbProperty.address || dbProperty.city || '',
        beds: dbProperty.bedrooms,
        baths: dbProperty.bathrooms,
        area_sqm: dbProperty.areaSqFt || 0,
        image_url: dbProperty.images?.[0] || '',
        images: dbProperty.images || [],
        status: dbProperty.status,
        latitude: dbProperty.latitude,
        longitude: dbProperty.longitude,
        realtor: this.formatRealtor(dbProperty.realtor),
        amenities: dbProperty.amenities || [],
      },
    };
  }

  async getSavedProperties(userId?: string) {
    if (!userId) {
      return { properties: [] };
    }

    const saved = await this.savedPropertyRepository.find({
      where: { userId },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });

    const properties = saved
      .filter((s) => !!s.property)
      .map((s) => ({
        id: s.property.id,
        title: s.property.title,
        location: s.property.address || s.property.district || s.property.city || 'Kigali',
        price: Number(s.property.price || 0),
        currency: 'RWF',
        type: s.property.status === 'RENTED' ? 'For Rent' : 'For Sale',
        image: s.property.images?.[0] || '',
        saved_at: s.createdAt,
      }));

    return { properties };
  }

  async saveProperty(userId: string, propertyId: string) {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['realtor'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const existing = await this.savedPropertyRepository.findOne({
      where: { userId, propertyId },
    });
    if (existing) {
      return { success: true, saved: true, property_id: propertyId };
    }

    await this.savedPropertyRepository.save(
      this.savedPropertyRepository.create({ userId, propertyId }),
    );

    if (property.realtor?.email) {
      const customer = await this.userRepository.findOne({ where: { id: userId } });
      const customerName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'A customer'
        : 'A customer';
      const realtorName = `${property.realtor.firstName || ''} ${property.realtor.lastName || ''}`.trim() || 'Realtor';
      this.mailService
        .sendPropertySavedEmail(property.realtor.email, realtorName, customerName, property.title)
        .catch((err) => console.error('Failed to send property-saved email:', err));
    }

    return { success: true, saved: true, property_id: propertyId };
  }

  async removeSavedProperty(userId: string, propertyId: string) {
    const existing = await this.savedPropertyRepository.findOne({
      where: { userId, propertyId },
    });
    if (!existing) {
      throw new NotFoundException('Saved property not found');
    }
    await this.savedPropertyRepository.remove(existing);
    return { success: true, removed: true, property_id: propertyId };
  }

  async getTours(userId?: string) {
    if (!userId) {
      return { tours: [] };
    }

    const tours = await this.tourRepository.find({
      where: { customerId: userId },
      relations: ['property', 'realtor'],
      order: { createdAt: 'DESC' },
    });

    await this.tourRepository.update(
      { customerId: userId, seenByCustomer: false },
      { seenByCustomer: true },
    );

    return {
      tours: tours.map((t) => ({
        id: t.id,
        property_id: t.propertyId,
        property_title: t.property?.title || 'Property Viewing',
        district: t.property?.district || t.property?.city || '',
        address: t.property?.address || t.property?.city || '',
        image_url: t.property?.images?.[0] || '',
        tour_date: t.tourDate,
        tour_time: t.tourTime,
        status: t.status,
        realtor: this.formatRealtor(t.realtor),
        notes: t.notes || '',
      })),
    };
  }

  async scheduleTour(userId: string, payload: any) {
    const { property_id, tour_date, tour_time, notes, name, email, phone } = payload || {};

    const dbProperty = await this.propertyRepository.findOne({
      where: { id: property_id },
      relations: ['realtor'],
    });

    if (!dbProperty) {
      throw new NotFoundException('Property not found');
    }

    const tour = this.tourRepository.create({
      propertyId: dbProperty.id,
      customerId: userId,
      realtorId: dbProperty.realtorId || undefined,
      clientName: name || '',
      clientEmail: email || '',
      clientPhone: phone || '',
      tourDate: tour_date || '',
      tourTime: tour_time || '',
      notes: notes || '',
      status: TourStatus.PENDING,
    });

    const saved = await this.tourRepository.save(tour);

    if (dbProperty.realtor?.email) {
      const customer = await this.userRepository.findOne({ where: { id: userId } });
      const customerName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || name || 'A customer'
        : name || 'A customer';
      const realtorName = `${dbProperty.realtor.firstName || ''} ${dbProperty.realtor.lastName || ''}`.trim() || 'Realtor';
      this.mailService
        .sendNewTourRequestEmail(dbProperty.realtor.email, realtorName, customerName, dbProperty.title, saved.tourDate, saved.tourTime)
        .catch((err) => console.error('Failed to send new-tour-request email:', err));
    }

    return {
      id: saved.id,
      property_id: saved.propertyId,
      property_title: dbProperty.title,
      district: dbProperty.district || dbProperty.city || '',
      address: dbProperty.address || dbProperty.city || '',
      image_url: dbProperty.images?.[0] || '',
      tour_date: saved.tourDate,
      tour_time: saved.tourTime,
      status: saved.status,
      realtor: this.formatRealtor(dbProperty.realtor),
      notes: saved.notes || '',
    };
  }

  async cancelTour(userId: string, id: string) {
    const tour = await this.tourRepository.findOne({
      where: { id, customerId: userId },
      relations: ['property', 'realtor'],
    });
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
    tour.status = TourStatus.CANCELLED;
    await this.tourRepository.save(tour);

    if (tour.realtor?.email) {
      const customer = await this.userRepository.findOne({ where: { id: userId } });
      const customerName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'A customer'
        : 'A customer';
      const realtorName = `${tour.realtor.firstName || ''} ${tour.realtor.lastName || ''}`.trim() || 'Realtor';
      this.mailService
        .sendTourStatusEmail(
          tour.realtor.email,
          realtorName,
          `${tour.property?.title || 'a listing'} (cancelled by ${customerName})`,
          'cancelled',
          tour.tourDate,
          tour.tourTime,
        )
        .catch((err) => console.error('Failed to send tour-cancelled email to realtor:', err));
    }

    return { id: tour.id, status: tour.status };
  }

  async getNotificationCounts(userId?: string) {
    if (!userId) {
      return { unreadMessages: 0, unseenTourUpdates: 0 };
    }

    const [unreadMessages, unseenTourUpdates] = await Promise.all([
      this.messageRepository.count({ where: { recipientId: userId, isRead: false } }),
      this.tourRepository.count({ where: { customerId: userId, seenByCustomer: false } }),
    ]);

    return { unreadMessages, unseenTourUpdates };
  }

  async getContacts() {
    // Realtors and platform admins are both reachable from the customer's
    // "Start a Message" picker - the search box lets a customer filter down
    // to an admin's name/email just as easily as a realtor's.
    const [realtors, admins] = await Promise.all([
      this.userRepository.find({
        where: { role: UserRole.REALTOR },
        select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'avatarUrl'],
      }),
      this.userRepository.find({
        where: { role: UserRole.ADMIN },
        select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'avatarUrl'],
      }),
    ]);

    const users = [
      ...realtors.map((r) => ({
        id: r.id,
        name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Realtor',
        email: r.email,
        phone: r.phoneNumber || '',
        avatar_url: r.avatarUrl || '',
        role: 'realtor',
      })),
      ...admins.map((a) => ({
        id: a.id,
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Remy Support',
        email: a.email,
        phone: a.phoneNumber || '',
        avatar_url: a.avatarUrl || '',
        role: 'admin',
      })),
    ];

    return { users };
  }

  async submitTestimonial(userId: string, payload: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const name = payload?.name || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || 'A customer';
    const content = (payload?.content || '').trim();

    if (!content) {
      throw new NotFoundException('Testimonial content is required.');
    }

    const testimonial = await this.testimonialRepository.save(
      this.testimonialRepository.create({
        name,
        role: payload?.role || 'Customer',
        content,
        rating: Math.min(5, Math.max(1, Number(payload?.rating) || 5)),
        isApproved: false,
        userId,
      }),
    );

    return {
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      is_approved: testimonial.isApproved,
      created_at: testimonial.createdAt,
    };
  }

  private async serializeConversation(conversation: Conversation, viewerId: string) {
    const unreadCount = await this.messageRepository.count({
      where: { conversationId: conversation.id, recipientId: viewerId, isRead: false },
    });

    return {
      id: conversation.id,
      realtor: this.formatRealtor(conversation.realtor),
      recipient_role: conversation.realtor?.role === UserRole.ADMIN ? 'admin' : 'realtor',
      property_id: conversation.propertyId || undefined,
      property_title: conversation.property?.title || undefined,
      last_message: conversation.lastMessage || '',
      last_updated: conversation.lastMessageAt || conversation.createdAt,
      unread_count: unreadCount,
    };
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationRepository.find({
      where: { customerId: userId },
      relations: ['realtor', 'property'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });

    return {
      conversations: await Promise.all(
        conversations.map((c) => this.serializeConversation(c, userId)),
      ),
    };
  }

  async startConversation(userId: string, payload: any) {
    const { realtor_id, property_id, message } = payload || {};

    // The "recipient" here can be a realtor or a platform admin - a customer
    // can reach out to either from the same "Start a Message" picker.
    const realtor = await this.userRepository.findOne({
      where: { id: realtor_id, role: In([UserRole.REALTOR, UserRole.ADMIN]) },
    });
    if (!realtor) {
      throw new NotFoundException('Recipient not found');
    }

    let property: Property | null = null;
    if (property_id) {
      property = await this.propertyRepository.findOne({ where: { id: property_id } });
    }

    const existingQuery = this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.customerId = :customerId', { customerId: userId })
      .andWhere('conversation.realtorId = :realtorId', { realtorId: realtor.id });

    if (property) {
      existingQuery.andWhere('conversation.propertyId = :propertyId', { propertyId: property.id });
    } else {
      existingQuery.andWhere('conversation.propertyId IS NULL');
    }

    let conversation = await existingQuery.getOne();

    if (!conversation) {
      conversation = await this.conversationRepository.save(
        this.conversationRepository.create({
          customerId: userId,
          realtorId: realtor.id,
          propertyId: property?.id || null,
        }),
      );
    }

    if (message && message.trim()) {
      await this.postMessage(conversation, MessageSenderType.CUSTOMER, userId, realtor.id, message.trim());
    }

    const fresh = await this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['realtor', 'property'],
    });

    return { conversation: await this.serializeConversation(fresh!, userId) };
  }

  private async postMessage(
    conversation: Conversation,
    senderType: MessageSenderType,
    senderId: string,
    recipientId: string,
    content: string,
  ) {
    const saved = await this.messageRepository.save(
      this.messageRepository.create({
        conversationId: conversation.id,
        senderType,
        senderId,
        recipientId,
        content,
      }),
    );

    conversation.lastMessage = content;
    conversation.lastMessageAt = saved.createdAt;
    await this.conversationRepository.save(conversation);

    return saved;
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['realtor', 'property'],
    });
    if (!conversation || conversation.customerId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    await this.messageRepository.update(
      { conversationId, recipientId: userId, isRead: false },
      { isRead: true },
    );

    return {
      conversation: await this.serializeConversation(conversation, userId),
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

  async sendMessage(userId: string, conversationId: string, content: string) {
    if (!content || !content.trim()) {
      throw new NotFoundException('Message content is required');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation || conversation.customerId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    const saved = await this.postMessage(
      conversation,
      MessageSenderType.CUSTOMER,
      userId,
      conversation.realtorId,
      content.trim(),
    );

    return {
      id: saved.id,
      conversation_id: conversationId,
      sender_type: saved.senderType,
      content: saved.content,
      is_read: saved.isRead,
      created_at: saved.createdAt.toISOString(),
    };
  }

  async getProfile(userId?: string) {
    let user: UserEntity | null = null;

    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { role: UserRole.CLIENT },
        order: { createdAt: 'ASC' },
      });
    }

    if (!user) {
      return {
        profile: {
          full_name: 'Valued Client',
          email: 'client@remy.com',
          phone: '+250 788 000 000',
          preferred_language: 'English',
          email_notifications: true,
          sms_notifications: true,
          tour_reminders: true,
          avatar_url: '',
        },
      };
    }

    return {
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Client',
        email: user.email,
        phone: user.phoneNumber || '+250 788 000 000',
        preferred_language: 'English',
        email_notifications: true,
        sms_notifications: true,
        tour_reminders: true,
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
        where: { role: UserRole.CLIENT },
        order: { createdAt: 'ASC' },
      });
    }

    if (!user) {
      return { message: 'No client user found to update', profile: payload };
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

    await this.userRepository.save(user);

    return {
      message: 'Profile updated successfully',
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phoneNumber,
        preferred_language: payload?.preferred_language || 'English',
        email_notifications: payload?.email_notifications ?? true,
        sms_notifications: payload?.sms_notifications ?? true,
        tour_reminders: payload?.tour_reminders ?? true,
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
        where: { role: UserRole.CLIENT },
        order: { createdAt: 'ASC' },
        select: ['id', 'passwordHash'],
      });
    }

    if (!user) {
      throw new NotFoundException('Client user not found.');
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
