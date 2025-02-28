import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { UserEntity } from '../user.entity';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { Role } from '../enum/role.enum';
import { AuthService } from '../../auth/auth.service';

class MockUserRepository {
  save(user: UserEntity) {
    return Promise.resolve(user); 
  }
}

class MockAuthService {
  async hashPassword(password: string) {
    return `hashed-${password}`; 
  }
}

describe('UserService - createUser', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockUserRepository,
        },
        {
          provide: AuthService,
          useClass: MockAuthService, 
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    authService = module.get<AuthService>(AuthService);
  });

  it('should create a new user and hash the password', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword',
      role: Role.USER, 
    };

    jest.spyOn(userRepository, 'save').mockResolvedValue({
      id: '1',
      ...createUserDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    const hashPasswordSpy = jest.spyOn(authService, 'hashPassword').mockResolvedValue('hashed-testpassword');

    const result = await service.createUser(createUserDto);

    expect(hashPasswordSpy).toHaveBeenCalledWith('testpassword'); 
    expect(result.username).toBe(createUserDto.username);
    expect(result.email).toBe(createUserDto.email);
    expect(result.role).toBe(createUserDto.role);
    expect(result).toHaveProperty('id'); 
    expect(result).toHaveProperty('createdAt'); 
    expect(result).toHaveProperty('updatedAt'); 
  });
});
