import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthJwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthJwtPayload }>();
    return request.user;
  },
);
