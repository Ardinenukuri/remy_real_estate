import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePropertyFeatureDto {
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}