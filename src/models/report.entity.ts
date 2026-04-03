import { BaseModel } from "./basic.models";

export class Report implements BaseModel {
    _id: string;
    reportName: string;
    reportType: 'PDF' | 'Excel';
}

export interface Report extends BaseModel {
    _id: string;
    reportName: string;
    reportType: 'PDF' | 'Excel';
}