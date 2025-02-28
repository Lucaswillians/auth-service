import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { AuthModule } from './auth/auth.module';
import { PostgresConfigService } from './config/db.config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PostgresConfigService,
    }),

  ],
})
export class AppModule { }
