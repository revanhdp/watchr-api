import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  originalTitle?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsString()
  studio?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  audioFormat?: string;

  @IsOptional()
  @IsString()
  colorGrade?: string;

  @IsOptional()
  colorPalette?: string | string[];

  @IsOptional()
  @IsString()
  curatorQuote?: string;

  @IsOptional()
  awards?: string | string[];

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  moodLabel?: string;

  @IsOptional()
  @IsString()
  backdrop?: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  tags?: string | string[];

  @IsOptional()
  chapters?: any;
}
