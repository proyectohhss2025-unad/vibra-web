import { BaseModel } from "./basic.models";
import { PermissionCategory } from "./permissionCategory.entity";
import { UserPermission } from "./userPermission.entity";

export interface Permission extends BaseModel {
  serial: string;
  name: string;
  description: string;
  permissionCategory?: PermissionCategory;
  usersPermission?: UserPermission[];
  isAssigned: boolean;
}

export class Permission implements BaseModel {
  _id: string;
  name: string;
  description: string;
  permissionCategory?: PermissionCategory;
  isAssigned: boolean;
}

