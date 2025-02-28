import { Role } from "../enum/role.enum";

export class GetUserDto {
  constructor(readonly id: string, readonly username: string, readonly password: string, readonly role: Role) { }
}