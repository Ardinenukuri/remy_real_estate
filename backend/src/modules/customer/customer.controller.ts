import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('explore')
  async getExploreProperties(@Req() req: any) {
    return this.customerService.getExploreProperties(req.user?.sub);
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.customerService.getDashboard(req.user?.sub);
  }

  @Get('properties/:id')
  async getPropertyDetails(@Req() req: any, @Param('id') id: string) {
    return this.customerService.getPropertyDetails(id, req.user?.sub);
  }

  @Get('notifications/counts')
  async getNotificationCounts(@Req() req: any) {
    return this.customerService.getNotificationCounts(req.user?.sub);
  }

  @Get('saved-properties')
  async getSavedProperties(@Req() req: any) {
    return this.customerService.getSavedProperties(req.user?.sub);
  }

  @Post('saved-properties')
  async saveProperty(@Req() req: any, @Body() body: { property_id?: string }) {
    return this.customerService.saveProperty(req.user?.sub, body?.property_id);
  }

  @Delete('saved-properties/:id')
  async removeSavedProperty(@Req() req: any, @Param('id') id: string) {
    return this.customerService.removeSavedProperty(req.user?.sub, id);
  }

  @Get('tours')
  async getTours(@Req() req: any) {
    return this.customerService.getTours(req.user?.sub);
  }

  @Post('tours')
  async scheduleTour(@Req() req: any, @Body() body: any) {
    return this.customerService.scheduleTour(req.user?.sub, body);
  }

  @Patch('tours/:id/cancel')
  async cancelTour(@Req() req: any, @Param('id') id: string) {
    return this.customerService.cancelTour(req.user?.sub, id);
  }

  @Get('users/contacts')
  async getContacts() {
    return this.customerService.getContacts();
  }

  @Post('testimonials')
  async submitTestimonial(@Req() req: any, @Body() body: any) {
    return this.customerService.submitTestimonial(req.user?.sub, body);
  }

  @Get('messages/conversations')
  async getConversations(@Req() req: any) {
    return this.customerService.getConversations(req.user?.sub);
  }

  @Post('messages/conversations')
  async startConversation(@Req() req: any, @Body() body: any) {
    return this.customerService.startConversation(req.user?.sub, body);
  }

  @Get('messages/conversations/:id')
  async getConversationMessages(@Req() req: any, @Param('id') id: string) {
    return this.customerService.getConversationMessages(req.user?.sub, id);
  }

  @Post('messages/conversations/:id')
  async sendMessage(@Req() req: any, @Param('id') id: string, @Body() body: { content?: string }) {
    return this.customerService.sendMessage(req.user?.sub, id, body?.content || '');
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.customerService.getProfile(req.user?.sub);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() payload: any) {
    return this.customerService.updateProfile(payload, req.user?.sub);
  }

  @Post('change-password')
  async changePassword(@Req() req: any, @Body() payload: any) {
    return this.customerService.changePassword(payload, req.user?.sub);
  }
}
