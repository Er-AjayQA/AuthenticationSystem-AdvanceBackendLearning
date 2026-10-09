import { User } from "@prisma/client";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
}
