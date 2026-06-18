import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiUsageType, Level, PlanType, User } from '@prisma/client';
import { PREMIUM_REQUIRED_CODE } from '../common/constants/premium';
import { isAiDevMode } from '../common/utils/ai-error.util';
import { PrismaService } from '../prisma/prisma.service';

export interface AiLimits {
  tutor: number;
  pronunciation: number;
  speaking: number;
  writing: number;
}

@Injectable()
export class PlanService {
  private readonly premiumLevels: Level[] = [Level.A2, Level.B1, Level.B2];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  isPremium(user: Pick<User, 'planType' | 'planExpiresAt'>): boolean {
    if (user.planType !== PlanType.PREMIUM) {
      return false;
    }

    if (!user.planExpiresAt) {
      return true;
    }

    return user.planExpiresAt.getTime() > Date.now();
  }

  async getUserPlan(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    return user;
  }

  canAccessLevel(
    user: Pick<User, 'planType' | 'planExpiresAt'>,
    level: Level,
  ): boolean {
    if (!this.premiumLevels.includes(level)) {
      return true;
    }
    return this.isPremium(user);
  }

  assertLevelAccess(
    user: Pick<User, 'planType' | 'planExpiresAt'>,
    level: Level,
  ): void {
    if (!this.canAccessLevel(user, level)) {
      throw new ForbiddenException({
        message: 'Upgrade to Premium to access A2 and higher lessons',
        error: PREMIUM_REQUIRED_CODE,
      });
    }
  }

  getAiLimits(user: Pick<User, 'planType' | 'planExpiresAt'>): AiLimits {
    if (isAiDevMode() || this.configService.get<boolean>('ai.devMode')) {
      return {
        tutor: 999_999,
        pronunciation: 999_999,
        speaking: 999_999,
        writing: 999_999,
      };
    }

    const premium = this.isPremium(user);

    return {
      tutor: premium
        ? this.configService.get<number>('ai.premiumTutorDailyLimit', 999)
        : this.configService.get<number>('ai.freeTutorDailyLimit', 999),
      pronunciation: premium
        ? this.configService.get<number>(
            'ai.premiumPronunciationDailyLimit',
            999,
          )
        : this.configService.get<number>('ai.freePronunciationDailyLimit', 999),
      speaking: premium
        ? this.configService.get<number>('ai.premiumSpeakingDailyLimit', 999)
        : this.configService.get<number>('ai.freeSpeakingDailyLimit', 999),
      writing: premium
        ? this.configService.get<number>('ai.premiumWritingDailyLimit', 999)
        : this.configService.get<number>('ai.freeWritingDailyLimit', 999),
    };
  }

  getLimitForType(
    user: Pick<User, 'planType' | 'planExpiresAt'>,
    type: AiUsageType,
  ): number {
    const limits = this.getAiLimits(user);

    switch (type) {
      case AiUsageType.TUTOR:
        return limits.tutor;
      case AiUsageType.PRONUNCIATION:
        return limits.pronunciation;
      case AiUsageType.EVALUATION:
        return limits.writing;
      default:
        return 999;
    }
  }
}
