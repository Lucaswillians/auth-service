import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/CreateUser.dto';
import { GetUserDto } from './dto/GetUser.dto';
import { UserService } from './user.service';
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Controller('/users')
export class UserController {
  @Inject()
  private userService: UserService;

  @Post()
  async postUser(@Body() userData: CreateUserDto) {
    const userCreated = await this.userService.createUser(userData)

    return {
      user: new GetUserDto(userCreated.id, userCreated.username, userCreated.password, userCreated.role),
      message: 'User created with success!'
    };
  };

  @Get()
  async getUser() {
    return await this.userService.getUsers();
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.getOne(id)
  }

  @Put('/:id')
  async updateUsers(@Param('id') id: string, @Body() newData: UpdateUserDto) {
    return { user: await this.userService.updateUser(id, newData), message: 'user updated with success!' };
  }

  @Delete('/:id')
  async deleteUsers(@Param('id') id: string) {
    return { user: await this.userService.deleteUser(id), message: 'user deleted with success!' };
  }
}