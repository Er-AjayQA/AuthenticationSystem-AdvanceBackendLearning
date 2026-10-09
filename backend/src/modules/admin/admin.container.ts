import { AuthRepository } from "../auth/auth.repository.js";
import { AdminRepository } from "./admin.repository.js";
import { AdminService } from "./admin.service.js";

const adminRepository = new AdminRepository();
const authRepository = new AuthRepository();
const adminService = new AdminService(adminRepository, authRepository);

export { adminService };
