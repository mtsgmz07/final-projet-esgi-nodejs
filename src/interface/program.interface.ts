import { BaseInterface } from "./base.interface";
import { Exercice } from "./exercice.model";
import { User } from "./user.interface";

export interface Program extends BaseInterface {
    title: string
    description: string
    user: User
    exercices: Exercice[]
    notes?: number | null
}