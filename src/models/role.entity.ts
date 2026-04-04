import { BaseModel } from "./basic.models";
import { PermissionTemplate } from "./permissionTemplate.entity";

/**
 * Enum para tipos de documento
 */
export enum TipoDocumento {
  CC = 'CC', // Cédula de Ciudadanía
  TI = 'TI', // Tarjeta de Identidad
  CE = 'CE', // Cédula de Extranjería
  PP = 'PP', // Pasaporte
  NIT = 'NIT', // Número de Identificación Tributaria
}

/**
 * Enum para roles de usuario en gestión de almacén
 */
export enum RolUsuario {
  ADMIN = 'Administrador',
  ALMACENISTA = 'Almacenista',
  AUXILIAR_INVENTARIO = 'Auxiliar Inventario',
  USUARIO_INTERNO = 'Usuario Interno',
  AUDITOR = 'Auditor',
}

/**
 * Enum para género
 */
export enum Genero {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
}

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

