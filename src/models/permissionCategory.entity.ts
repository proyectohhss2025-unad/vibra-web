import { BaseModel } from "./basic.models";

export interface PermissionCategory extends BaseModel {
    serial: string;
    name: string;
    description: string;
    isActive?: boolean;
  }

export class PermissionCategory implements BaseModel {
    serial: string;
    name: string;
    description: string;
    isActive?: boolean;
}

  