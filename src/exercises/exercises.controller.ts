import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppRole } from '../common/constants/roles';
import { Roles } from '../common/decorators/roles.decorator';
import { successResponse } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('admin/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  async create(@Body() dto: CreateExerciseDto) {
    const exercise = await this.exercisesService.create(dto);
    return successResponse(exercise);
  }

  @Get('lesson/:lessonId')
  async findByLesson(@Param('lessonId') lessonId: string) {
    const exercises = await this.exercisesService.findByLesson(lessonId);
    return successResponse(exercises);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const exercise = await this.exercisesService.findById(id);
    return successResponse(exercise);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    const exercise = await this.exercisesService.update(id, dto);
    return successResponse(exercise);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const exercise = await this.exercisesService.remove(id);
    return successResponse(exercise);
  }
}
