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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtService } from '@nestjs/jwt';
import { RealtorService } from './realtor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('realtor')
export class RealtorController {
  constructor(
    private readonly realtorService: RealtorService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('directory')
  async getPublicDirectory() {
    // Public: the "Meet Our Realtors" marketing page.
    return this.realtorService.getPublicDirectory();
  }

  @Get('properties')
  async getProperties(@Query() query: any, @Req() req: any) {
    // Public: anyone can browse property listings (admin-approved only).
    // realtor_id only unlocks non-approved (pending) properties when it
    // matches the caller's own verified identity, so a realtor viewing
    // their own "My Listings" page can see their pending submissions too.
    let requesterId: string | undefined;
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync(authHeader.split(' ')[1]);
        requesterId = payload?.sub;
      } catch {
        // Invalid/expired token: treat as anonymous, fall through to public view.
      }
    }

    const ownRequest = query?.realtor_id && query.realtor_id === requesterId;
    return this.realtorService.getProperties(ownRequest ? query : { ...query, realtor_id: undefined });
  }

  @Get('properties/:id')
  async getPropertyById(@Req() req: any, @Param('id') id: string) {
    // Public: anyone can view a property's details page, logged in or not.
    // We still resolve the viewer's identity when a token is present so view
    // counting can exclude the realtor previewing their own listing.
    let viewerId: string | undefined;
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync(authHeader.split(' ')[1]);
        viewerId = payload?.sub;
      } catch {
        // Invalid/expired token: treat as anonymous, fall through to public view.
      }
    }

    return this.realtorService.getPropertyById(id, viewerId);
  }

  @Patch('properties/:id')
  @UseGuards(JwtAuthGuard)
  async updateProperty(@Param('id') id: string, @Body() payload: any) {
    return this.realtorService.updateProperty(id, payload);
  }

  @Delete('properties/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProperty(@Param('id') id: string) {
    return this.realtorService.deleteProperty(id);
  }

  @Post('properties')
  @UseGuards(JwtAuthGuard)
  async createProperty(@Body() payload: any) {
    return this.realtorService.createProperty(payload);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  @Get('categories')
  async getCategories() {
    // Public: anyone can view categories
    return this.realtorService.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() payload: any) {
    // Authenticated: only logged-in users can create categories
    return this.realtorService.createCategory(payload);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() req: any) {
    return this.realtorService.getDashboard(req.user?.sub);
  }

  @Get('messages/conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    return this.realtorService.getConversations(req.user?.sub);
  }

  @Get('messages/conversations/:id')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(@Req() req: any, @Param('id') id: string) {
    return this.realtorService.getConversationMessages(req.user?.sub, id);
  }

  @Post('messages/conversations/:id')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Req() req: any, @Param('id') id: string, @Body() body: { content?: string }) {
    return this.realtorService.sendMessage(req.user?.sub, id, body?.content || '');
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  async getAppointments(@Req() req: any) {
    return this.realtorService.getAppointments(req.user?.sub);
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  async createAppointment(@Req() req: any, @Body() payload: any) {
    return this.realtorService.createAppointment(req.user?.sub, payload);
  }

  @Patch('appointments/:id')
  @UseGuards(JwtAuthGuard)
  async updateAppointmentStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status?: string }) {
    return this.realtorService.updateAppointmentStatus(req.user?.sub, id, body?.status || 'pending');
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(@Req() req: any, @Query('range') range = '30d') {
    return this.realtorService.getAnalytics(req.user?.sub, range);
  }

  @Get('notifications/counts')
  @UseGuards(JwtAuthGuard)
  async getNotificationCounts(@Req() req: any) {
    return this.realtorService.getNotificationCounts(req.user?.sub);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.realtorService.getProfile(req.user?.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() payload: any) {
    return this.realtorService.updateProfile(payload, req.user?.sub);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() payload: any) {
    return this.realtorService.changePassword(payload, req.user?.sub);
  }
}