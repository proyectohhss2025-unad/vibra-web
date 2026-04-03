import { BaseModel } from "./basic.models";
import { Permission } from "./permission.entity";
import { PermissionCategory } from "./permissionCategory.entity";

export interface UserPermission extends BaseModel {
    serial: string;
    name: string;
    description: string;
    permissionCategory?: PermissionCategory;
    usersPermission?: UserPermission[];
    permission: Permission;
  }

export class UserPermission implements BaseModel {
    _id: string;
    name: string;
    nit: string;
    address: string;
    phoneNumber: string;
    email: string;
    permission: Permission;
}

  