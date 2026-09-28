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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';
import { UpdatePropertyFeatureDto } from './dto/update-property-feature.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('notifications/counts')
  async getNotificationCounts(@Req() req: any) {
    return this.adminService.getNotificationCounts(req.user?.sub);
  }

  @Get('messages/conversations')
  async getConversations(@Req() req: any) {
    return this.adminService.getConversations(req.user?.sub);
  }

  @Get('messages/conversations/:id')
  async getConversationMessages(@Req() req: any, @Param('id') id: string) {
    return this.adminService.getConversationMessages(req.user?.sub, id);
  }

  @Post('messages/conversations/:id')
  async sendMessage(@Req() req: any, @Param('id') id: string, @Body() body: { content?: string }) {
    return this.adminService.sendMessage(req.user?.sub, id, body?.content || '');
  }

  @Get('users')
  async getUsers(@Query('filter') filter = 'all') {
    return this.adminService.getUsers(filter);
  }

  @Patch('users/:id/verify')
  async verifyUser(@Param('id') id: string, @Body() body: { is_verified?: boolean }) {
    return this.adminService.updateUserVerification(id, body?.is_verified ?? true);
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role?: string }) {
    return this.adminService.updateUserRole(id, body?.role ?? 'customer');
  }

  @Patch('users/:id/ban')
  async banUser(@Param('id') id: string, @Body() body: { is_banned?: boolean }) {
    return this.adminService.updateUserBan(id, body?.is_banned ?? true);
  }

  @Get('properties')
  async getAdminProperties(@Query() query: QueryPropertiesDto) {
    return this.adminService.getAdminProperties(
      query.filter || 'all',
      query.search || '',
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('properties/stats')
  async getPropertyStats() {
    return this.adminService.getPropertyStats();
  }

  @Patch('properties/:id/approve')
  async approveProperty(
    @Param('id') id: string,
    @Body() body: UpdatePropertyStatusDto,
  ) {
    return this.adminService.approveProperty(id, body?.is_approved ?? true);
  }

  @Patch('properties/:id/feature')
  async featureProperty(
    @Param('id') id: string,
    @Body() body: UpdatePropertyFeatureDto,
  ) {
    return this.adminService.featureProperty(id, body?.is_featured ?? true);
  }

  @Delete('properties/:id')
  async deleteProperty(@Param('id') id: string) {
    return this.adminService.deleteProperty(id);
  }

  @Get('profile')
  async getAdminProfile(@Req() req: any) {
    return this.adminService.getAdminProfile(req.user?.sub);
  }

  @Put('profile')
  async updateAdminProfile(@Req() req: any, @Body() payload: any) {
    return this.adminService.updateAdminProfile(payload, req.user?.sub);
  }

  @Post('change-password')
  async changeAdminPassword(@Req() req: any, @Body() payload: any) {
    return this.adminService.changeAdminPassword(payload, req.user?.sub);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Get('blogs')
  async getBlogs() {
    return this.adminService.getBlogs();
  }

  @Post('blogs')
  async createBlog(@Body() payload: any) {
    return this.adminService.createBlog(payload);
  }

  @Patch('blogs/:id')
  async updateBlog(@Param('id') id: string, @Body() payload: any) {
    return this.adminService.updateBlog(id, payload);
  }

  @Delete('blogs/:id')
  async deleteBlog(@Param('id') id: string) {
    return this.adminService.deleteBlog(id);
  }

  @Get('faqs')
  async getFaqs() {
    return this.adminService.getFaqs();
  }

  @Post('faqs')
  async createFaq(@Body() payload: any) {
    return this.adminService.createFaq(payload);
  }

  @Patch('faqs/:id')
  async updateFaq(@Param('id') id: string, @Body() payload: any) {
    return this.adminService.updateFaq(id, payload);
  }

  @Delete('faqs/:id')
  async deleteFaq(@Param('id') id: string) {
    return this.adminService.deleteFaq(id);
  }

  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() payload: any) {
    return this.adminService.createCategory(payload);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get('testimonials')
  async getTestimonials() {
    return this.adminService.getTestimonials();
  }

  @Patch('testimonials/:id/approve')
  async approveTestimonial(@Param('id') id: string, @Body() body: { is_approved?: boolean }) {
    return this.adminService.approveTestimonial(id, body?.is_approved ?? true);
  }

  @Get('messages')
  async getMessages() {
    return this.adminService.getMessages();
  }

  @Patch('messages/:id/status')
  async updateMessageStatus(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.adminService.updateMessageStatus(id, body?.status ?? 'read');
  }
}