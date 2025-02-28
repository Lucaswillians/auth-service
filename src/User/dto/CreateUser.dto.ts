import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @IsEnum(Role, { message: 'Role must be either user or admin' })
  readonly role: Role = Role.USER; 
}
