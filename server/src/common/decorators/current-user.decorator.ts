import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User, UserDocument } from '../../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest<{ user: UserDocument }>();
    return request.user;
  },
);
