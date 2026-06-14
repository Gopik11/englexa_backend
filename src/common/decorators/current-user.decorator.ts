import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import type { Request } from '../types/express-http';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthJwtPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthJwtPayload }>();
    return request.user;
  },
);
