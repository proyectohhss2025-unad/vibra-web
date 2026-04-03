import { BaseModel } from "./basic.models";

export class NotificationChannel implements BaseModel {
    title: string;
    description?: string;
    level?: number;
    notifications?: Notification[];
}

export interface NotificationChannel extends BaseModel {
    title: string;
    description?: string;
    level?: number;
    notifications?: Notification[];
}


