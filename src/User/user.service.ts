import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { Inject, Injectable, NotFoundException, UseGuards, forwardRef } from "@nestjs/common";
import { CreateUserDto } from "./dto/CreateUser.dto";
import { GetUserDto } from "./dto/GetUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) { }

  async createUser(userData: CreateUserDto) {
    const userEntity = new UserEntity();

    const hashedPassword = await this.authService.hashPassword(userData.password)

    userEntity.username = userData.username;
    userEntity.email = userData.email;
    userEntity.password = hashedPassword;
    userEntity.role = userData.role

    return this.userRepository.save(userEntity)
  }

  async getUsers() {
    const savedUsers = await this.userRepository.find();
    const usersList = savedUsers.map((user) => new GetUserDto(user.id, user.username, user.password, user.role));

    return usersList;
  }

  async getOneJWTverify(username: string) {
    const name = await this.userRepository.findOne({ where: { username } })

    if (!name) throw new NotFoundException(`User ${name} not found`);

    return new GetUserDto(name.id, name.username, name.password, name.role)
  }

  async getOne(id: string) {
    const userId = await this.userRepository.findOne({ where: { id } });

    if (!userId) throw new NotFoundException(`User with id ${id} not found`);

    return new GetUserDto(userId.id, userId.username, userId.password, userId.role)
  }

  async updateUser(id: string, newData: UpdateUserDto) {
    const user = await this.userRepository.preload({ id, ...newData, });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    
    if (newData.password) user.password = await this.authService.hashPassword(newData.password);

    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    return await this.userRepository.delete(id);
  }
}