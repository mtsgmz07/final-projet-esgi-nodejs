import { BaseInterface } from "./base.interface";

export interface Exercice extends BaseInterface {
    title: string
    description: string
    time: Date
}