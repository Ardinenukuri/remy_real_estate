import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RealtorService } from './realtor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('realtor')
@UseGuards(JwtAuthGuard)
export class RealtorController {
  constructor(private readonly realtorService: RealtorService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.realtorService.getDashboard(req.user?.sub);
  }

  @Get('inquiries')
  async getInquiries() {
    return this.realtorService.getInquiries();
  }

  @Patch('inquiries/:id')
  async updateInquiryStatus(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.realtorService.updateInquiryStatus(id, body?.status || 'pending');
  }

  @Delete('inquiries/:id')
  async deleteInquiry(@Param('id') id: string) {
    return this.realtorService.deleteInquiry(id);
  }

  @Post('inquiries/:id/reply')
  async replyToInquiry(@Param('id') id: string, @Body() body: { message?: string }) {
    return this.realtorService.replyToInquiry(id, body?.message || '');
  }

  @Get('appointments')
  async getAppointments() {
    return this.realtorService.getAppointments();
  }

  @Post('appointments')
  async createAppointment(@Body() payload: any) {
    return this.realtorService.createAppointment(payload);
  }

  @Patch('appointments/:id')
  async updateAppointmentStatus(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.realtorService.updateAppointmentStatus(id, body?.status || 'pending');
  }

  @Get('analytics')
  async getAnalytics(@Query('range') range = '30d') {
    return this.realtorService.getAnalytics(range);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.realtorService.getProfile(req.user?.sub);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() payload: any) {
    return this.realtorService.updateProfile(payload, req.user?.sub);
  }

  @Post('change-password')
  async changePassword(@Req() req: any, @Body() payload: any) {
    return this.realtorService.changePassword(payload, req.user?.sub);
  }
}