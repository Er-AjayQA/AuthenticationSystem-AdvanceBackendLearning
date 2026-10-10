import { z } from "zod";
import { PermissionValues } from "../../common/constants/permissions.js";

export const getRoleByIdSchema = z
  .object({
    roleId: z.uuid(),
  })
  .strict();

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(
      /^[A-Z_]+$/,
      "Role name must contains only uppercase letter and underscores",
    ),
  permissions: z.array(z.enum(PermissionValues)).min(1),
});

export const updateRoleParamsSchema = z.object({
  roleId: z.uuid("Invalid roleId in params"),
});

export const updateRoleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .regex(
        /^[A-Z_]+$/,
        "Role name must contains only uppercase letter and underscores",
      )
      .optional(),
    permissions: z.array(z.enum(PermissionValues)).min(1).optional(),
  })
  .refine((data) => data.name !== undefined || data.permissions !== undefined, {
    message: "Atleast one field must be provided",
  });

export const deleteRolesParamsSchema = z
  .object({
    roleId: z.uuid("Invalid roleId provided in params"),
  })
  .strict();

export const assignRolesParamsSchema = z.object({
  userId: z.uuid("Invalid userId provided in params"),
});

export const assignRolesBodySchema = z.object({
  roleIds: z.array(z.uuid()).min(1, "Atleast assign any one role"),
});

export type CreateRoleInputDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleInputDTO = z.infer<typeof updateRoleSchema>;
export type AssignRolesBodyDTO = z.infer<typeof assignRolesBodySchema>;
