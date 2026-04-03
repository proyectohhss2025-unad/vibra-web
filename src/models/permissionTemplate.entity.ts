import { BaseModel } from "./basic.models";
import { Permission } from "./permission.entity";

export interface PermissionTemplate extends BaseModel {
  name: string;
  description: string;
  permissions?: Permission[];
}

export class PermissionTemplate implements BaseModel {
  name: string;
  description: string;
  permissions?: Permission[];
}

