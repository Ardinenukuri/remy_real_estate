import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getUsers(@Query('filter') filter = 'all') {
    return this.adminService.getUsers(filter);
  }

  @Patch(':id/verify')
  async verifyUser(@Param('id') id: string, @Body() body: { is_verified?: boolean }) {
    return this.adminService.updateUserVerification(id, body?.is_verified ?? true);
  }

  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role?: string }) {
    return this.adminService.updateUserRole(id, body?.role ?? 'customer');
  }

  @Patch(':id/ban')
  async banUser(@Param('id') id: string, @Body() body: { is_banned?: boolean }) {
    return this.adminService.updateUserBan(id, body?.is_banned ?? true);
  }
}