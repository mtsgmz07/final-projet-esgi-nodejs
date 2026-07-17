import { BaseInterface } from "./base.interface";

export interface User extends BaseInterface {
    name: string
    lastName: string
    email: string
    password: string
    role: UserRole
    weight: number,
    size: number
    age: number
    passwordChangedAt?: Date | null
}

export enum UserRole {
    USER = 'USER',
    COACH = 'COACH',
    ADMIN = 'ADMIN'
}