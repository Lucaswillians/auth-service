import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RateLimiterService } from '../rateLimiter.service';
import { LoginAttempt } from '../loginAttemp.entity';

class MockRepository {
  createQueryBuilder() {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0), 
    };
  }

  save() {
    return Promise.resolve({}); 
  }

  delete() {
    return Promise.resolve({});
  }
}

describe('RateLimiterService - Simple Test', () => {
  let service: RateLimiterService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: getRepositoryToken(LoginAttempt),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    repo = module.get<MockRepository>(getRepositoryToken(LoginAttempt));
  });

  it('should allow first 5 login attempts', async () => {
    const ip = '192.168.0.1';
    const userId = 'user123';

    for (let i = 0; i < 5; i++) {
      const result = await service.checkLoginAttempt(ip, userId);
      expect(result).toBe(true); 
    }
  });
});
