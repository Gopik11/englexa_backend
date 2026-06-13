import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppRole } from '../common/constants/roles';
import { Roles } from '../common/decorators/roles.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@Controller('admin/lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  async create(@Body() dto: CreateLessonDto) {
    const lesson = await this.lessonsService.create(dto);
    return successResponse(lesson);
  }

  @Get()
  async findAll(@Query() query: LessonQueryDto) {
    const lessons = await this.lessonsService.findAll(query);
    return successResponse(lessons);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonsService.findById(id);
    return successResponse(lesson);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    const lesson = await this.lessonsService.update(id, dto);
    return successResponse(lesson);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const lesson = await this.lessonsService.remove(id);
    return successResponse(lesson);
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string) {
    const lesson = await this.lessonsService.setPublished(id, true);
    return successResponse(lesson);
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    const lesson = await this.lessonsService.setPublished(id, false);
    return successResponse(lesson);
  }
}
