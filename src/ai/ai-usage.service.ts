import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AiUsageType } from '@prisma/client';
import { PREMIUM_REQUIRED_CODE } from '../common/constants/premium';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../subscription/plan.service';

@Injectable()
export class AiUsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}

  async checkAndIncrement(
    userId: string,
    type: AiUsageType,
  ): Promise<{ used: number; limit: number }> {
    const user = await this.planService.getUserPlan(userId);
    const limit = this.planService.getLimitForType(user, type);
    const { periodStart, periodEnd } = this.currentDayWindow();

    const usage = await this.prisma.aIUsage.findFirst({
      where: {
        userId,
        type,
        periodStart,
      },
    });

    const currentCount = usage?.count ?? 0;

    if (currentCount >= limit) {
      const premium = this.planService.isPremium(user);
      throw new HttpException(
        {
          message: premium
            ? `Daily ${type.toLowerCase()} limit reached`
            : 'Free plan daily AI limit reached. Upgrade to Premium for more.',
          error: premium ? 'RATE_LIMIT_EXCEEDED' : PREMIUM_REQUIRED_CODE,
          details: { used: currentCount, limit, upgradeSuggested: !premium },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (usage) {
      await this.prisma.aIUsage.update({
        where: { id: usage.id },
        data: { count: currentCount + 1 },
      });
    } else {
      await this.prisma.aIUsage.create({
        data: {
          userId,
          type,
          count: 1,
          periodStart,
          periodEnd,
        },
      });
    }

    return { used: currentCount + 1, limit };
  }

  private currentDayWindow(): { periodStart: Date; periodEnd: Date } {
    const now = new Date();
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);
    return { periodStart, periodEnd };
  }
}
