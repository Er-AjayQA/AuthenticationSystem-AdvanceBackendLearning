import { AppError } from "../../common/errors/AppError.js";

export const ensureRoleIsEditable = (role: { isSystem: boolean }) => {
  if (role.isSystem) {
    throw new AppError("System roles can't be edited", 403);
  }
};

export const ensureRoleIsDeletable = (role: { isSystem: boolean }) => {
  if (role.isSystem) {
    throw new AppError("System roles can't be deleted", 403);
  }
};

export const ensureRoleIsAssignable = (role: { isSystem: boolean }) => {
  if (role.isSystem) {
    throw new AppError("System roles can't be assigned", 403);
  }
};

export const ensureRoleIsRemovable = (role: { isSystem: boolean }) => {
  if (role.isSystem) {
    throw new AppError("System roles are not removable", 403);
  }
};
