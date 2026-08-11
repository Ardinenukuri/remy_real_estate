import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePropertyStatusDto {
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;
}