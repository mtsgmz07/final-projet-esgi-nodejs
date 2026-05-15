import { BaseInterface } from "./base.interface";
import { Exercice } from "./exercice.model";
import { User } from "./user.interface";

export interface Program extends BaseInterface {
    user: User
    exercices: Exercice[]
}