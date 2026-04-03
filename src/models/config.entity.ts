import { BaseModel } from "./basic.models";

export interface Config extends BaseModel {
    name: string;
    description: string;
    flag: boolean;
    allowedUsers: any;
    disallowedUsers: any;
}

export class Config implements BaseModel {
    name!: string;
    description: string;
    flag: boolean;
    allowedUsers: any;
    disallowedUsers: any;
}
