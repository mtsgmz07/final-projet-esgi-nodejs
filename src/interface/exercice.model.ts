import { BaseInterface } from "./base.interface";

export interface Exercice extends BaseInterface {
    title: string
    description: string
    // Durée stockée en timestamp (millisecondes), max 25 min (1 500 000 ms)
    time: number
    imageUrl?: string | null
}