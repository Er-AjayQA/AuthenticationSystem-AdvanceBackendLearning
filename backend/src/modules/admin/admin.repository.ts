import { prisma } from "../../lib/prisma.js";
import { IAdminRepository } from "./admin.interface.js";

export class AdminRepository implements IAdminRepository {
  async findAllUsers() {
    const allUsers = await prisma.user.findMany();
    return allUsers;
  }
}
