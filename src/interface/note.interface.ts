import { Schema } from "mongoose";
import { BaseInterface } from "./base.interface";
import { Program } from "./program.interface";
import { User } from "./user.interface";

export interface Note extends BaseInterface {
    note: number
    program: Program | string
    user: User | string
}