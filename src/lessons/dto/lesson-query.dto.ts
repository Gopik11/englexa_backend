import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Level } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class LessonQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  published?: boolean;
}
