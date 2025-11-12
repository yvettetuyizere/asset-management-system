// src/dtos/profile.dto.ts
import { IsString, IsOptional, IsEmail, Matches } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, { message: "Phone number must be 10-15 digits" })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
