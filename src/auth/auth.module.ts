import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/User/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoginAttempt } from './rate-limiter/loginAttemp.entity';
import { RateLimiterService } from './rate-limiter/rateLimiter.service';
import { WinstonModule } from 'nest-winston';
import { appLogger } from 'src/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, LoginAttempt]),
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
    }),
    WinstonModule.forRoot(appLogger),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService, RateLimiterService],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
