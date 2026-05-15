import { BaseInterface } from "./base.interface";
import { User } from "./user.interface";

export interface History extends BaseInterface {
    user: User
    weight: number
    program: string
    time: Date
}