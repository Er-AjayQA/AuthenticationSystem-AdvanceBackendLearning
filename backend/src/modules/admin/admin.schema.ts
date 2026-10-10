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

export type CreateRoleInputDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleInputDTO = z.infer<typeof updateRoleSchema>;
