import { Inject, Injectable, LoggerService, UnauthorizedException, forwardRef } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../User/user.service";
import { RateLimiterService } from "./rate-limiter/rateLimiter.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class AuthService {
  private readonly saltRounds: number = 10;

  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly rateLimiterService: RateLimiterService;

  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;  

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async signIn(username: string, password: string, ip: string) {
    this.logger.warn(`Login try to user: ${username}`);

    const canAttemptLogin = await this.rateLimiterService.checkLoginAttempt(ip, username);

    if (!canAttemptLogin) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }

    const user = await this.userService.getOneJWTverify(username);

    if (!user) {
      this.logger.warn(`User not found -> catched by log: ${username}`);
      throw new UnauthorizedException('User not found!');
    }

    const passwordMatch = await this.comparePasswords(password, user.password);

    if (!passwordMatch) {
      this.logger.warn(`Password incorrect -> catched by log: ${username}`);
      throw new UnauthorizedException('Invalid credentials!');
    }

    await this.rateLimiterService.resetAttempts(ip, username);

    const payload = { sub: user.id, username: user.username };

    this.logger.info(`Login successful -> catched by log: ${username}`);

    return { message: 'Login successful', access_token: await this.jwtService.signAsync(payload) };
  }
}
