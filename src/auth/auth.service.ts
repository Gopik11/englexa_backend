import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '@prisma/client';
import { AppRole } from '../common/constants/roles';
import { UsersService } from '../users/users.service';
import { GamificationService } from '../gamification/gamification.service';
import { AuthJwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly gamificationService: GamificationService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.LEARNER,
      ageGroup: dto.ageGroup,
      level: dto.level,
      country: dto.country,
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.gamificationService.recordLogin(user.id);
    return { user: this.sanitizeUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const accessPayload: AuthJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as AppRole,
      type: 'access',
    };

    const refreshPayload: AuthJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as AppRole,
      type: 'refresh',
    };

    const accessSecret = this.configService.getOrThrow<string>(
      'jwt.accessSecret',
    );
    const refreshSecret = this.configService.getOrThrow<string>(
      'jwt.refreshSecret',
    );
    const accessExpiresIn = this.configService.get<number>(
      'jwt.accessExpiresInSeconds',
      900,
    );
    const refreshExpiresIn = this.configService.get<number>(
      'jwt.refreshExpiresInSeconds',
      604800,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...accessPayload },
        { secret: accessSecret, expiresIn: accessExpiresIn },
      ),
      this.jwtService.signAsync(
        { ...refreshPayload },
        { secret: refreshSecret, expiresIn: refreshExpiresIn },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
