import { BaseModel } from "./basic.models";
import { Participant } from "./participant.entity";
import { User } from "./user.entity";

export interface Notification extends BaseModel {
  ID: string;
  title: string;
  message: string;
  isRead?: boolean;
  user?: User;
  participant?: Participant;
  notificationType: any;
  notificationChannel: any;
  priority: number;
}

export class Notification implements BaseModel {
  ID: string;
  title: string;
  message: string;
  isRead?: boolean;
  user?: User;
  participant?: Participant;
  notificationType: any;
  notificationChannel: any;
  priority: number;
}
