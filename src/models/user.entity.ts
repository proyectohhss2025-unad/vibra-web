import { BaseModel } from "./basic.models";
import { Company } from "./company.entity";
import { DocumentType } from "./documentType.entity";
import { Role } from "./role.entity";

export interface AvatarGalleryItem {
    id: string;
    type: 'preset' | 'upload';
    src: string;
    label?: string;
    addedAt: string;
}

export interface User extends BaseModel {
    userId: string;
    email: string;
    password: string;
    name: string;
    documentType: DocumentType;
    documentNumber: string;
    address: string;
    phoneNumber: string
    username: string;
    avatarUrl?: string;
    role?: Role;
    company?: Company;
    isLogged: boolean;
    avatar?: string;
    sub?: string;
    avatarGallery?: AvatarGalleryItem[];
}

export class User implements BaseModel {
    userId: string;
    email: string;
    password: string;
    name: string;
    documentType: DocumentType;
    documentNumber: string;
    address: string;
    phoneNumber: string;
    username: string;
    avatarUrl?: string;
    role?: Role;
    company?: Company;
    isLogged: boolean;
    avatar?: string;
    sub?: string;
    avatarGallery?: AvatarGalleryItem[];
}
