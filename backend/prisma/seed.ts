import { Permissions } from "../src/common/constants/permissions";
import { prisma } from "../src/lib/prisma";
import { logger } from "../src/config/logger";
import { hashPassword } from "../src/common/auth/password";
import { env } from "../src/config/env.config";

async function main() {
  const permissions = [
    Permissions.MANAGE_USERS,
    Permissions.DELETE_USERS,
    Permissions.VIEW_ANALYTICS,
    Permissions.MANAGE_ROLES,
  ];

  // Admin Roles to DB
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });
  logger.info("Admin Roles added successfully");

  // Add Permissions to DB
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission,
      },

      update: {},

      create: { name: permission },
    });
  }
  logger.info("Admin permissions created successfully");

  // Fetch DB Permissions
  const dbPermissions = await prisma.permission.findMany();

  // Assign Permissions to Admin
  for (const permission of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_persmissionId: {
          roleId: adminRole.id,
          persmissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        persmissionId: permission.id,
      },
    });
  }
  logger.info("Permissions assigned to Admin role successfully");

  // Create Initial Admin User & Assign Role

  const existingAdmin = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL },
  });

  let adminUser;

  if (!existingAdmin) {
    const adminHashPassword = await hashPassword(env.ADMIN_PASSWORD);

    adminUser = await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL,
        passwordHash: adminHashPassword,
      },
    });

    logger.info("Admin created successfully");
  } else {
    adminUser = existingAdmin;
    logger.info("Admin user already exist");
  }

  // Assign User Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  logger.info("Admin role assigned successfully");
  logger.info("Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
