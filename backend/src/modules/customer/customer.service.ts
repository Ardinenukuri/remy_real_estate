import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  private readonly savedProperties = [
    {
      id: '1',
      title: 'Modern Luxury Villa in Kiyovu',
      district: 'Kiyovu',
      address: 'KN 14 Ave, Kigali',
      price: 350000,
      type: 'sale',
      beds: 4,
      baths: 3,
      area_sqm: 320,
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      saved_at: '2026-08-01',
    },
    {
      id: '2',
      title: 'Executive High-Rise Apartment',
      district: 'Gacuriro',
      address: 'KG 564 St, Kigali',
      price: 1800,
      type: 'rent',
      beds: 2,
      baths: 2,
      area_sqm: 110,
      image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      saved_at: '2026-08-05',
    },
    {
      id: '3',
      title: 'Contemporary Family Residence',
      district: 'Nyashishi',
      address: 'KK 32 Rd, Kigali',
      price: 220000,
      type: 'sale',
      beds: 3,
      baths: 2.5,
      area_sqm: 210,
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      saved_at: '2026-08-08',
    },
  ];

  private readonly tours = [
    {
      id: 'tour-101',
      property_id: '1',
      property_title: 'Modern Luxury Villa in Kiyovu',
      district: 'Kiyovu',
      address: 'KN 14 Ave, Kigali',
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      tour_date: '2026-08-18',
      tour_time: '10:00 AM',
      status: 'confirmed',
      realtor: {
        name: 'Eric Manzi',
        phone: '+250 788 123 456',
        email: 'eric.m@remy.com',
      },
      notes: 'Meeting agent directly at the main entrance gate.',
    },
    {
      id: 'tour-102',
      property_id: '2',
      property_title: 'Executive High-Rise Apartment',
      district: 'Gacuriro',
      address: 'KG 564 St, Kigali',
      image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      tour_date: '2026-08-22',
      tour_time: '02:30 PM',
      status: 'pending',
      realtor: {
        name: 'Aline Uwase',
        phone: '+250 788 987 654',
        email: 'aline.u@remy.com',
      },
    },
    {
      id: 'tour-100',
      property_id: '3',
      property_title: 'Contemporary Family Residence',
      district: 'Nyashishi',
      address: 'KK 32 Rd, Kigali',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tour_date: '2026-07-28',
      tour_time: '11:00 AM',
      status: 'completed',
      realtor: {
        name: 'Eric Manzi',
        phone: '+250 788 123 456',
        email: 'eric.m@remy.com',
      },
    },
  ];

  private readonly conversations = [
    {
      id: 'conv-1',
      realtor: {
        id: 'agent-1',
        name: 'Eric Manzi',
        email: 'eric.m@remy.com',
        phone: '+250 788 123 456',
      },
      property_title: 'Modern Luxury Villa in Kiyovu',
      property_id: '1',
      last_message: 'Hi! Yes, tomorrow at 10:00 AM works perfectly for the tour.',
      last_updated: '10:42 AM',
      unread_count: 1,
    },
    {
      id: 'conv-2',
      realtor: {
        id: 'agent-2',
        name: 'Aline Uwase',
        email: 'aline.u@remy.com',
        phone: '+250 788 987 654',
      },
      property_title: 'Executive High-Rise Apartment',
      property_id: '2',
      last_message: 'Can you please confirm if the utilities are included in the price?',
      last_updated: 'Yesterday',
      unread_count: 0,
    },
  ];

  private readonly messages: Record<string, any[]> = {
    'conv-1': [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_type: 'customer',
        content: 'Hello Eric! Is the Modern Villa in Kiyovu still available for viewing this week?',
        created_at: '10:15 AM',
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_type: 'realtor',
        content: 'Hello! Yes, it is currently available. Would Tuesday or Wednesday suit you best?',
        created_at: '10:28 AM',
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_type: 'customer',
        content: 'Tuesday morning would be great for me.',
        created_at: '10:35 AM',
      },
      {
        id: 'msg-4',
        conversation_id: 'conv-1',
        sender_type: 'realtor',
        content: 'Hi! Yes, tomorrow at 10:00 AM works perfectly for the tour.',
        created_at: '10:42 AM',
      },
    ],
    'conv-2': [
      {
        id: 'msg-5',
        conversation_id: 'conv-2',
        sender_type: 'realtor',
        content: 'Hello! Let me know if you have any questions regarding the high-rise apartment in Gacuriro.',
        created_at: 'Yesterday 3:10 PM',
      },
      {
        id: 'msg-6',
        conversation_id: 'conv-2',
        sender_type: 'customer',
        content: 'Can you please confirm if the utilities are included in the price?',
        created_at: 'Yesterday 4:05 PM',
      },
    ],
  };

  async getExploreProperties() {
    const dbProperties = await this.propertyRepository.find({
      where: { isApproved: true },
      relations: ['realtor'],
      take: 20,
    });

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
      is_saved: this.savedProperties.some((s) => s.id === p.id),
    }));

    return { properties };
  }

  async getDashboard() {
    const [totalProperties, totalUsers] = await Promise.all([
      this.propertyRepository.count(),
      this.userRepository.count(),
    ]);

    return {
      stats: {
        savedPropertiesCount: this.savedProperties.length,
        upcomingToursCount: this.tours.filter(
          (t) => t.status === 'confirmed' || t.status === 'pending',
        ).length,
        unreadMessagesCount: this.conversations.reduce(
          (acc, c) => acc + (c.unread_count || 0),
          0,
        ),
        totalProperties,
        totalUsers,
      },
      recentSaved: this.savedProperties.slice(0, 3),
      upcomingTours: this.tours
        .filter((t) => t.status === 'confirmed' || t.status === 'pending')
        .slice(0, 3),
    };
  }

  async getPropertyDetails(id: string) {
    const saved = this.savedProperties.find((p) => p.id === id);
    if (saved) {
      return {
        property: {
          ...saved,
          description: 'A stunning property with premium finishes, modern architecture, and a beautifully designed living space. Perfect for families and investors seeking quality real estate.',
          status: 'available',
          realtor: {
            name: 'Eric Manzi',
            phone: '+250 788 123 456',
            email: 'eric.m@remy.com',
          },
          amenities: ['Swimming Pool', 'Garden', 'Garage', 'Air Conditioning', 'Security', 'Parking'],
        },
      };
    }

    const dbProperty = await this.propertyRepository.findOne({
      where: { id },
      relations: ['realtor'],
    });

    if (!dbProperty) {
      throw new NotFoundException('Property not found');
    }

    return {
      property: {
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description || 'No description available.',
        price: Number(dbProperty.price || 0),
        type: dbProperty.status === 'RENTED' ? 'rent' : 'sale',
        district: dbProperty.district || dbProperty.city || '',
        address: dbProperty.address || dbProperty.city || '',
        beds: dbProperty.bedrooms,
        baths: dbProperty.bathrooms,
        area_sqm: dbProperty.areaSqFt || 0,
        image_url: dbProperty.images?.[0] || '',
        status: dbProperty.status,
        realtor: dbProperty.realtor
          ? {
              name: `${dbProperty.realtor.firstName || ''} ${dbProperty.realtor.lastName || ''}`.trim(),
              phone: dbProperty.realtor.phoneNumber || '+250 788 000 000',
              email: dbProperty.realtor.email,
            }
          : {
              name: 'Remy Real Estate',
              phone: '+250 788 000 000',
              email: 'info@remy.com',
            },
        amenities: [],
      },
    };
  }

  async getSavedProperties() {
    return { properties: this.savedProperties };
  }

  async removeSavedProperty(id: string) {
    const index = this.savedProperties.findIndex((p) => p.id === id);
    if (index < 0) {
      throw new NotFoundException('Saved property not found');
    }
    this.savedProperties.splice(index, 1);
    return { removed: true, id };
  }

  async getTours() {
    return { tours: this.tours };
  }

  async scheduleTour(payload: any) {
    const { property_id, tour_date, tour_time, notes } = payload || {};

    const savedProperty = this.savedProperties.find((p) => p.id === property_id);
    const dbProperty = await this.propertyRepository.findOne({
      where: { id: property_id },
      relations: ['realtor'],
    });

    const tour = {
      id: `tour-${Date.now()}`,
      property_id: property_id || '1',
      property_title: savedProperty?.title || dbProperty?.title || 'Property Viewing',
      district: savedProperty?.district || dbProperty?.district || dbProperty?.city || '',
      address: savedProperty?.address || dbProperty?.address || dbProperty?.city || '',
      image_url: savedProperty?.image_url || dbProperty?.images?.[0] || '',
      tour_date: tour_date || '',
      tour_time: tour_time || '',
      status: 'pending',
      realtor: {
        name: dbProperty?.realtor
          ? `${dbProperty.realtor.firstName || ''} ${dbProperty.realtor.lastName || ''}`.trim()
          : 'Eric Manzi',
        phone: dbProperty?.realtor?.phoneNumber || '+250 788 123 456',
        email: dbProperty?.realtor?.email || 'eric.m@remy.com',
      },
      notes: notes || '',
    };

    this.tours.push(tour);
    return tour;
  }

  async cancelTour(id: string) {
    const tour = this.tours.find((t) => t.id === id);
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
    tour.status = 'cancelled';
    return tour;
  }

  async getContacts() {
    const realtors = await this.userRepository.find({
      where: { role: UserRole.REALTOR },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
    });

    const users = realtors.map((r) => ({
      id: r.id,
      name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Realtor',
      email: r.email,
      phone: r.phoneNumber || '',
      role: 'realtor',
    }));

    return { users };
  }

  async getConversations() {
    return { conversations: this.conversations };
  }

  async getConversationMessages(conversationId: string) {
    const conversation = this.conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return { messages: this.messages[conversationId] || [] };
  }

  async sendMessage(conversationId: string, content: string) {
    const conversation = this.conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_type: 'customer',
      content,
      created_at: 'Just now',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(message);

    conversation.last_message = content;
    conversation.last_updated = 'Just now';
    conversation.unread_count = 0;

    return message;
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