import { BaseInterface } from "./base.interface";

export interface User extends BaseInterface {
    name: string
    lastName: string
    email: string
    password: string
    role: UserRole
    weight: number,
    size: number
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN'
}