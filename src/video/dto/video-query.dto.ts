import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VideoQueryDto {
  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
