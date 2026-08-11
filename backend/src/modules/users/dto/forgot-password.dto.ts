import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({})
  email: string | undefined;
}
