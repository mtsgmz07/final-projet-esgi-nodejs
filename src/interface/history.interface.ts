import { BaseInterface } from "./base.interface";
import { User } from "./user.interface";
import { Program } from "./program.interface";

export interface History extends BaseInterface {
    userId: User | string
    programId: Program | string
    start: Date
    end: Date | null
    weight: number | null
}