import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { normalizeResponse } from '../common/utils/response-normalizer.util';
import { emptyHomeData } from './dto/home-data.dto';
import { HomeService } from './home.service';

@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('word-of-the-day')
  async getWordOfTheDay(@CurrentUser() user: AuthJwtPayload) {
    const word = await this.homeService.getWordOfTheDay(user.sub);
    return normalizeResponse({
      word: word.word ?? '',
      meaning: word.meaning ?? '',
      example: word.example ?? '',
      level: word.level ?? 'beginner',
    });
  }

  @Get('quote-of-the-day')
  async getQuoteOfTheDay(@CurrentUser() user: AuthJwtPayload) {
    const quote = await this.homeService.getQuoteOfTheDay(user.sub);
    return normalizeResponse({
      quote: quote.quote ?? '',
      category: quote.category ?? '',
      explanation: quote.explanation ?? '',
    });
  }

  @Get('puzzle-of-the-day')
  async getPuzzleOfTheDay(@CurrentUser() user: AuthJwtPayload) {
    const puzzle = await this.homeService.getPuzzleOfTheDay(user.sub);
    return normalizeResponse(puzzle);
  }

  @Get('crossword')
  async getCrossword(@CurrentUser() user: AuthJwtPayload) {
    const crossword = await this.homeService.getCrossword(user.sub);
    return normalizeResponse(crossword);
  }

  @Get('mini-lesson')
  async getMiniLesson(@CurrentUser() user: AuthJwtPayload) {
    const lesson = await this.homeService.getFeaturedMiniLesson(user.sub);
    return normalizeResponse(lesson);
  }

  @Get('srs-due')
  async getSrsDue(@CurrentUser() user: AuthJwtPayload) {
    const items = await this.homeService.getSrsDueReviews(user.sub);
    return normalizeResponse({ items: items ?? [] });
  }

  @Get('predictions')
  async getPredictions(@CurrentUser() user: AuthJwtPayload) {
    const predictions = await this.homeService.getPredictionRecommendations(
      user.sub,
    );
    return normalizeResponse({ predictions: predictions ?? [] });
  }

  @Get('daily-challenge')
  async getDailyChallenge(@CurrentUser() user: AuthJwtPayload) {
    const challenge = await this.homeService.getDailyChallenge(user.sub);
    return normalizeResponse(challenge);
  }

  @Get('home-data')
  async getHomeData(@CurrentUser() user: AuthJwtPayload) {
    const data = await this.homeService.getHomeData(user.sub);
    return normalizeResponse(data ?? emptyHomeData());
  }
}

