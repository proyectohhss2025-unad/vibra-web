import { BaseModel } from "./basic.models";

export interface Feedback extends BaseModel {
  title: string;
  description: string;
  isFeature?: boolean;
  isSupport?: boolean;
  isActive?: boolean;
}

export class Feedback implements BaseModel {
  title: string;
  description: string;
  isFeature?: boolean;
  isSupport?: boolean;
  isActive?: boolean;
}

