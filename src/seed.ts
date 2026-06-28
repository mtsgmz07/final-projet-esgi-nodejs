import bcrypt from "bcrypt";
import { connectDB, closeDB } from "./db";
import { UserModel } from "./models/user.model";
import { ExerciceModel } from "./models/exercice.model";
import { ProgramModel } from "./models/program.model";
import { NoteModel } from "./models/note.model";
import { FavorisModel } from "./models/favoris.model";
import { HistoryModel } from "./models/history.model";
import { UserRole } from "./interface/user.interface";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "password123";

// --- Petits helpers de génération aléatoire ---
const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

const pickMany = <T>(arr: T[], count: number): T[] => {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < count && copy.length > 0; i++) {
        result.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
    }
    return result;
};

const randomDate = (daysBack: number) =>
    new Date(Date.now() - rand(0, daysBack) * 24 * 60 * 60 * 1000);

// --- Données de base ---
const FIRST_NAMES = [
    "Lucas", "Emma", "Hugo", "Léa", "Gabriel", "Chloé", "Louis", "Manon",
    "Jules", "Camille", "Adam", "Sarah", "Nathan", "Inès", "Tom", "Jade",
    "Théo", "Louise", "Raphaël", "Alice",
];

const LAST_NAMES = [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
    "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
    "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
];

const EXERCICE_TITLES = [
    "Développé couché", "Squat", "Soulevé de terre", "Tractions",
    "Dips", "Curl biceps", "Extension triceps", "Presse à cuisses",
    "Fentes", "Rowing barre", "Développé militaire", "Gainage",
    "Crunch", "Mollets debout", "Élévations latérales",
];

const PROGRAM_TITLES = [
    "Prise de masse débutant", "Full body 3 jours", "Push Pull Legs",
    "Sèche intensive", "Force et puissance", "Cardio HIIT",
    "Programme haut du corps", "Spécial jambes", "Remise en forme",
    "Endurance musculaire",
];

const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.";

const slugify = (s: string) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]/g, "");

const seed = async () => {
    await connectDB();

    // Nettoyage de TOUTES les collections (users inclus)
    await Promise.all([
        UserModel.deleteMany({}),
        ExerciceModel.deleteMany({}),
        ProgramModel.deleteMany({}),
        NoteModel.deleteMany({}),
        FavorisModel.deleteMany({}),
        HistoryModel.deleteMany({}),
    ]);
    console.log("Toutes les collections ont été nettoyées.");

    // 0. Utilisateurs (mot de passe hashé via bcrypt -> connexion possible)
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    const usedEmails = new Set<string>();

    const userDocs = Array.from({ length: 10 }, (_, i) => {
        const name = pick(FIRST_NAMES);
        const lastName = pick(LAST_NAMES);
        let email = `${slugify(name)}.${slugify(lastName)}@example.com`;
        // Garantit l'unicité des emails
        if (usedEmails.has(email)) {
            email = `${slugify(name)}.${slugify(lastName)}${i}@example.com`;
        }
        usedEmails.add(email);

        return {
            name,
            lastName,
            email,
            password: hashedPassword,
            // Le premier utilisateur est admin pour faciliter les tests
            role: i === 0 ? UserRole.ADMIN : pick([UserRole.USER, UserRole.COACH]),
            weight: rand(50, 110),
            size: rand(150, 200),
            age: rand(18, 65),
        };
    });

    const users = await UserModel.insertMany(userDocs);
    const userIds = users.map((u) => u._id);
    console.log(`${users.length} utilisateurs créés (mot de passe: "${DEFAULT_PASSWORD}").`);

    // 1. Exercices
    const exercices = await ExerciceModel.insertMany(
        Array.from({ length: 20 }, () => ({
            title: pick(EXERCICE_TITLES),
            description: lorem,
            time: new Date(0, 0, 0, 0, rand(1, 5), rand(0, 59)),
        }))
    );
    console.log(`${exercices.length} exercices créés.`);

    // 2. Programmes (référence user + exercices)
    const programs = await ProgramModel.insertMany(
        Array.from({ length: 15 }, () => ({
            title: pick(PROGRAM_TITLES),
            description: lorem,
            user: pick(userIds),
            exercices: pickMany(
                exercices.map((e) => e._id),
                rand(3, 6)
            ),
        }))
    );
    console.log(`${programs.length} programmes créés.`);

    // 3. Notes (référence user + program, note 0-20)
    const notes = await NoteModel.insertMany(
        Array.from({ length: 30 }, () => ({
            note: rand(0, 20),
            program: pick(programs)._id,
            user: pick(userIds),
        }))
    );
    console.log(`${notes.length} notes créées.`);

    // 4. Favoris (référence user + program)
    // Index unique (user, program) -> on génère des paires uniques.
    const favorisPairs = new Map<string, { user: any; program: any }>();
    let attempts = 0;
    while (favorisPairs.size < 20 && attempts < 200) {
        attempts++;
        const user = pick(userIds);
        const program = pick(programs)._id;
        const key = `${user}_${program}`;
        if (!favorisPairs.has(key)) {
            favorisPairs.set(key, { user, program });
        }
    }
    const favoris = await FavorisModel.insertMany([...favorisPairs.values()]);
    console.log(`${favoris.length} favoris créés.`);

    // 5. Historiques (référence user, program = string)
    const histories = await HistoryModel.insertMany(
        Array.from({ length: 40 }, () => ({
            user: pick(userIds),
            weight: rand(40, 150),
            program: pick(PROGRAM_TITLES),
            time: randomDate(90),
        }))
    );
    console.log(`${histories.length} historiques créés.`);

    console.log("Seed terminé avec succès.");
    await closeDB();
    process.exit(0);
};

seed().catch(async (err) => {
    console.error("Erreur durant le seed:", err);
    await closeDB();
    process.exit(1);
});
