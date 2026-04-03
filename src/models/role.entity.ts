import { BaseModel } from "./basic.models";
import { PermissionTemplate } from "./permissionTemplate.entity";

export interface Role extends BaseModel {
  name: string;
  description: string;
  permissionTemplate?: PermissionTemplate;
  isSuperAdmin?: boolean;
}

export class Role implements BaseModel {
  name: string;
  description: string;
  permissionTemplate?: PermissionTemplate;
  isSuperAdmin?: boolean;
}

