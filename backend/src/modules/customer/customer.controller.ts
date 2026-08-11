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
  async getExploreProperties() {
    return this.customerService.getExploreProperties();
  }

  @Get('dashboard')
  async getDashboard() {
    return this.customerService.getDashboard();
  }

  @Get('properties/:id')
  async getPropertyDetails(@Param('id') id: string) {
    return this.customerService.getPropertyDetails(id);
  }

  @Get('saved-properties')
  async getSavedProperties() {
    return this.customerService.getSavedProperties();
  }

  @Delete('saved-properties/:id')
  async removeSavedProperty(@Param('id') id: string) {
    return this.customerService.removeSavedProperty(id);
  }

  @Get('tours')
  async getTours() {
    return this.customerService.getTours();
  }

  @Post('tours')
  async scheduleTour(@Body() body: any) {
    return this.customerService.scheduleTour(body);
  }

  @Patch('tours/:id/cancel')
  async cancelTour(@Param('id') id: string) {
    return this.customerService.cancelTour(id);
  }

  @Get('users/contacts')
  async getContacts() {
    return this.customerService.getContacts();
  }

  @Get('messages/conversations')
  async getConversations() {
    return this.customerService.getConversations();
  }

  @Get('messages/conversations/:id')
  async getConversationMessages(@Param('id') id: string) {
    return this.customerService.getConversationMessages(id);
  }

  @Post('messages/conversations/:id')
  async sendMessage(@Param('id') id: string, @Body() body: { content?: string }) {
    return this.customerService.sendMessage(id, body?.content || '');
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