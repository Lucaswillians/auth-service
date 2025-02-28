import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../User/user.service';
import { RateLimiterService } from '../rate-limiter/rateLimiter.service';
import { JwtService } from '@nestjs/jwt';

class MockUserService {
  async getOneJWTverify(username: string) {
    return { id: '1', username, password: 'hashed-testpassword' }; 
  }
}

class MockRateLimiterService {
  async checkLoginAttempt(ip: string, username: string) {
    return true; 
  }

  async resetAttempts(ip: string, username: string) {
    return true; 
  }
}

class MockJwtService {
  async signAsync(payload: any) {
    return 'fake-jwt-token'; 
  }
}

describe('AuthService - signIn', () => {
  let service: AuthService;
  let userService: UserService;
  let rateLimiterService: RateLimiterService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useClass: MockUserService },
        { provide: RateLimiterService, useClass: MockRateLimiterService },
        { provide: JwtService, useClass: MockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    rateLimiterService = module.get<RateLimiterService>(RateLimiterService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return a JWT token on successful login', async () => {
    const username = 'testuser';
    const password = 'testpassword';
    const ip = '127.0.0.1';

    jest.spyOn(service, 'comparePasswords').mockResolvedValue(true); 

    const result = await service.signIn(username, password, ip);

    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBe('fake-jwt-token'); 
    expect(result.message).toBe('Login successful');
  });
});
