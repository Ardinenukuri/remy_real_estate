import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';

@Injectable()
export class RealtorService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  private readonly inquiries = [
    {
      id: 'inq-1',
      property_id: '1',
      property: { id: '1', title: 'Modern Luxury Villa in Kiyovu', district: 'Kiyovu', price: 350000 },
      name: 'Ardine Nukuri',
      email: 'ardine@example.com',
      phone: '+250 788 000 000',
      message: 'I am interested in viewing this property. Is it still available?',
      status: 'pending',
      created_at: '2026-08-10T10:00:00Z',
    },
    {
      id: 'inq-2',
      property_id: '2',
      property: { id: '2', title: 'Executive High-Rise Apartment', district: 'Gacuriro', price: 1800 },
      name: 'Jean Claude',
      email: 'jean@example.com',
      phone: '+250 788 111 222',
      message: 'Can you provide more details about the monthly rent?',
      status: 'contacted',
      created_at: '2026-08-08T14:30:00Z',
    },
  ];

  private readonly appointments = [
    {
      id: 'appt-1',
      property_id: '1',
      property: { id: '1', title: 'Modern Luxury Villa in Kiyovu', district: 'Kiyovu' },
      client_name: 'Ardine Nukuri',
      client_email: 'ardine@example.com',
      client_phone: '+250 788 000 000',
      date: '2026-08-18',
      time: '10:00',
      notes: 'Client requested morning tour.',
      status: 'confirmed',
      created_at: '2026-08-10T10:00:00Z',
    },
    {
      id: 'appt-2',
      property_id: '2',
      property: { id: '2', title: 'Executive High-Rise Apartment', district: 'Gacuriro' },
      client_name: 'Jean Claude',
      client_email: 'jean@example.com',
      client_phone: '+250 788 111 222',
      date: '2026-08-22',
      time: '14:30',
      notes: '',
      status: 'pending',
      created_at: '2026-08-08T14:30:00Z',
    },
  ];

  async getDashboard(realtorId?: string) {
    const [totalProperties, totalInquiries, totalAppointments] = await Promise.all([
      this.propertyRepository.count({ where: realtorId ? { realtorId } : {} }),
      this.inquiryRepository.count(),
      Promise.resolve(this.appointments.length),
    ]);

    return {
      stats: {
        totalProperties,
        totalInquiries,
        totalAppointments,
        pendingInquiries: this.inquiries.filter((i) => i.status === 'pending').length,
        pendingAppointments: this.appointments.filter((a) => a.status === 'pending').length,
      },
      recentInquiries: this.inquiries.slice(0, 5),
      recentAppointments: this.appointments.slice(0, 5),
    };
  }

  async getInquiries() {
    return { inquiries: this.inquiries };
  }

  async updateInquiryStatus(id: string, status: string) {
    const inquiry = this.inquiries.find((i) => i.id === id);
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    inquiry.status = status;
    return inquiry;
  }

  async deleteInquiry(id: string) {
    const index = this.inquiries.findIndex((i) => i.id === id);
    if (index < 0) {
      throw new NotFoundException('Inquiry not found');
    }
    this.inquiries.splice(index, 1);
    return { deleted: true, id };
  }

  async replyToInquiry(id: string, message: string) {
    const inquiry = this.inquiries.find((i) => i.id === id);
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    inquiry.status = 'contacted';
    return { message: 'Reply sent successfully', inquiry };
  }

  async getAppointments() {
    return { appointments: this.appointments };
  }

  async createAppointment(payload: any) {
    const appointment = {
      id: `appt-${Date.now()}`,
      ...payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.appointments.push(appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string) {
    const appointment = this.appointments.find((a) => a.id === id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    appointment.status = status;
    return appointment;
  }

  async getAnalytics(range = '30d') {
    return {
      overview: {
        totalViews: 4250,
        viewsTrend: 12.5,
        totalInquiries: 318,
        inquiriesTrend: 8.2,
        totalBookings: 46,
        bookingsTrend: -2.4,
        conversionRate: 7.4,
        conversionTrend: 1.1,
      },
      topProperties: [
        { id: '1', title: 'Modern Villa in Kiyovu', views: 1420, inquiries: 89, price: 350000 },
        { id: '2', title: 'Luxury Apartment in Gacuriro', views: 980, inquiries: 64, price: 180000 },
        { id: '3', title: 'Commercial Space in Nyarugenge', views: 760, inquiries: 42, price: 500000 },
        { id: '4', title: 'Cozy Family Home in Kicukiro', views: 540, inquiries: 31, price: 120000 },
      ],
      monthlyViews: [
        { month: 'Jan', views: 1200, inquiries: 80 },
        { month: 'Feb', views: 1500, inquiries: 95 },
        { month: 'Mar', views: 1800, inquiries: 110 },
        { month: 'Apr', views: 2100, inquiries: 140 },
        { month: 'May', views: 2400, inquiries: 160 },
        { month: 'Jun', views: 2800, inquiries: 190 },
      ],
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
          full_name: 'Eric Manzi',
          email: 'eric.m@remy.com',
          phone: '+250 788 123 456',
          agency_name: 'Remy Premium Properties',
          license_number: 'RWA-RE-2024-089',
          years_experience: 6,
          bio: 'Dedicated real estate professional specializing in high-end residential listings.',
          specialization: 'Residential & Villa Developments',
          office_address: 'KG 7 Ave, Kigali',
          is_verified: true,
        },
      };
    }

    return {
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Realtor Agent',
        email: user.email,
        phone: user.phoneNumber || '+250 788 123 456',
        agency_name: 'Remy Premium Properties',
        license_number: 'RWA-RE-2024-089',
        years_experience: 6,
        bio: 'Dedicated real estate professional specializing in high-end residential listings.',
        specialization: 'Residential & Villa Developments',
        office_address: 'KG 7 Ave, Kigali',
        is_verified: Boolean(user.isVerifiedRealtor),
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

    await this.userRepository.save(user);

    return {
      message: 'Realtor profile updated successfully',
      profile: {
        full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phoneNumber,
        agency_name: payload?.agency_name || 'Remy Premium Properties',
        license_number: payload?.license_number || 'RWA-RE-2024-089',
        years_experience: payload?.years_experience || 6,
        bio: payload?.bio || '',
        specialization: payload?.specialization || 'Residential & Villa Developments',
        office_address: payload?.office_address || 'KG 7 Ave, Kigali',
        is_verified: Boolean(user.isVerifiedRealtor),
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