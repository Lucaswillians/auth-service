import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/User/dto/CreateUser.dto";
import { RateLimiterService } from "./rate-limiter/rateLimiter.service";


@Controller('/auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @Inject()
  private readonly rateLimiterService: RateLimiterService;  // Injetando RateLimiterService

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() userData: CreateUserDto) {
    const { username, password } = userData;
    const ip = 'some-ip';  // Idealmente você pegaria o IP real do request, como: req.ip

    // Verificar se o IP ou usuário está bloqueado devido a tentativas excessivas
    const canLogin = await this.rateLimiterService.checkLoginAttempt(ip, username);

    if (!canLogin) {
      throw new UnauthorizedException('Too many login attempts, please try again later.');
    }

    // Continuar com o processo de login se não estiver bloqueado
    return this.authService.signIn(username, password, ip);
  }
}
