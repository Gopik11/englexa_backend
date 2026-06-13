import { Injectable, NotFoundException } from '@nestjs/common';
import { AgeGroup, Level, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: UserRole;
  ageGroup?: AgeGroup;
  level?: Level;
  country?: string;
}

const profileSelect = {
  id: true,
  email: true,
  role: true,
  ageGroup: true,
  level: true,
  country: true,
  planType: true,
  planExpiresAt: true,
  xp: true,
  streak: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{ select: typeof profileSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? UserRole.LEARNER,
        ageGroup: data.ageGroup,
        level: data.level,
        country: data.country,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
