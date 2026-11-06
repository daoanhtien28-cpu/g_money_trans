import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';

export interface JwtRefreshPayload {
  sub: string;
  cardNumber?: string;
  email?: string;
}


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret as string,
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const body = req.body as { refreshToken?: string };
    const refreshToken = body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    return user;
  }
}
