import { BaseInterface } from "./base.interface";
import { Program } from "./program.interface";
import { User } from "./user.interface";

export interface Favoris extends BaseInterface {
    program: Program
    user: User
}