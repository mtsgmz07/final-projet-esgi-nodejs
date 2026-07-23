import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { connectDB, closeDB } from "./db";
import { UserModel } from "./models/user.model";
import { ExerciceModel } from "./models/exercice.model";
import { ProgramModel } from "./models/program.model";
import { NoteModel } from "./models/note.model";
import { FavorisModel } from "./models/favoris.model";
import { HistoryModel } from "./models/history.model";
import { UserRole } from "./interface/user.interface";
import { UPLOAD_DIR } from "./utils/upload";

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

// Durée d'exercice en timestamp (millisecondes) : entre 5 et 25 min max
const MAX_EXERCICE_TIME_MS = 25 * 60 * 1000;
const randomExerciceTime = () =>
    Math.min(rand(5, 25) * 60 * 1000, MAX_EXERCICE_TIME_MS);

// =====================================================================
// 1. Images de test (8 max) — copiées depuis src/assets/seed-images
//    vers le dossier /uploads servi statiquement par Express.
// =====================================================================
const SEED_IMAGES_DIR = path.join(__dirname, "assets", "seed-images");

type Categorie =
    | "pectoraux"
    | "dos"
    | "jambes"
    | "epaules"
    | "bras"
    | "abdos"
    | "cardio"
    | "etirements";

const IMAGE_FILES: Record<Categorie, string> = {
    pectoraux: "pectoraux.png",
    dos: "dos.png",
    jambes: "jambes.png",
    epaules: "epaules.png",
    bras: "bras.png",
    abdos: "abdos.png",
    cardio: "cardio.png",
    etirements: "etirements.png",
};

const copySeedImages = (): Record<Categorie, string> => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const urls = {} as Record<Categorie, string>;
    for (const [categorie, file] of Object.entries(IMAGE_FILES) as [Categorie, string][]) {
        const destName = `seed-${file}`;
        fs.copyFileSync(path.join(SEED_IMAGES_DIR, file), path.join(UPLOAD_DIR, destName));
        urls[categorie] = `/uploads/${destName}`;
    }
    return urls;
};

// =====================================================================
// 2. Utilisateurs principaux (identifiants fixes -> voir SEED_LOGINS.md)
// =====================================================================
const MAIN_USERS = [
    {
        name: "Alice",
        lastName: "Martin",
        email: "alice.martin@example.com",
        role: UserRole.ADMIN,
        weight: 62,
        size: 168,
        age: 29,
    },
    {
        name: "Karim",
        lastName: "Benali",
        email: "karim.benali@example.com",
        role: UserRole.COACH,
        weight: 84,
        size: 182,
        age: 35,
    },
    {
        name: "Lucas",
        lastName: "Dubois",
        email: "lucas.dubois@example.com",
        role: UserRole.USER,
        weight: 75,
        size: 178,
        age: 24,
    },
    {
        name: "Emma",
        lastName: "Leroy",
        email: "emma.leroy@example.com",
        role: UserRole.USER,
        weight: 58,
        size: 164,
        age: 27,
    },
];

// Quelques utilisateurs supplémentaires pour donner du volume
const EXTRA_USERS = [
    { name: "Hugo", lastName: "Moreau", email: "hugo.moreau@example.com", role: UserRole.COACH, weight: 90, size: 188, age: 41 },
    { name: "Chloé", lastName: "Petit", email: "chloe.petit@example.com", role: UserRole.USER, weight: 55, size: 160, age: 22 },
    { name: "Nathan", lastName: "Roux", email: "nathan.roux@example.com", role: UserRole.USER, weight: 70, size: 175, age: 31 },
    { name: "Léa", lastName: "Fournier", email: "lea.fournier@example.com", role: UserRole.USER, weight: 63, size: 170, age: 26 },
    { name: "Tom", lastName: "Garcia", email: "tom.garcia@example.com", role: UserRole.USER, weight: 80, size: 180, age: 38 },
    { name: "Inès", lastName: "Vincent", email: "ines.vincent@example.com", role: UserRole.USER, weight: 60, size: 166, age: 33 },
];

// =====================================================================
// 3. Exercices réels, classés par groupe musculaire (image associée)
// =====================================================================
type ExerciceSeed = { title: string; description: string; categorie: Categorie };

const EXERCICES: ExerciceSeed[] = [
    // Pectoraux
    { categorie: "pectoraux", title: "Développé couché à la barre", description: "Allongé sur un banc plat, descendez la barre jusqu'à la poitrine puis poussez vers le haut. Exercice de base pour les pectoraux, les épaules et les triceps. 4 séries de 8 à 10 répétitions." },
    { categorie: "pectoraux", title: "Développé incliné aux haltères", description: "Sur un banc incliné à 30°, poussez les haltères au-dessus de la poitrine. Cible la partie haute des pectoraux. 4 séries de 10 répétitions." },
    { categorie: "pectoraux", title: "Écarté couché aux haltères", description: "Bras légèrement fléchis, ouvrez les haltères en arc de cercle jusqu'à sentir l'étirement des pectoraux, puis revenez. 3 séries de 12 répétitions." },
    { categorie: "pectoraux", title: "Dips prise large", description: "Aux barres parallèles, buste penché vers l'avant, descendez jusqu'à ce que les épaules passent sous les coudes. Excellent pour le bas des pectoraux. 3 séries au maximum de répétitions." },
    { categorie: "pectoraux", title: "Pompes classiques", description: "Corps gainé, mains à largeur d'épaules, descendez la poitrine près du sol puis repoussez. Exercice au poids du corps réalisable partout. 4 séries de 15 à 20 répétitions." },
    // Dos
    { categorie: "dos", title: "Tractions en pronation", description: "Suspendu à la barre fixe, mains en pronation, tirez jusqu'à amener le menton au-dessus de la barre. Exercice roi pour l'épaisseur et la largeur du dos. 4 séries au maximum de répétitions." },
    { categorie: "dos", title: "Rowing barre buste penché", description: "Buste penché à 45°, tirez la barre vers le nombril en serrant les omoplates. Développe l'épaisseur du milieu du dos. 4 séries de 8 à 10 répétitions." },
    { categorie: "dos", title: "Tirage vertical à la poulie", description: "Assis face à la machine, tirez la barre vers le haut de la poitrine en gardant le buste droit. Alternative aux tractions pour cibler le grand dorsal. 4 séries de 12 répétitions." },
    { categorie: "dos", title: "Rowing haltère à un bras", description: "Un genou et une main en appui sur le banc, tirez l'haltère le long du corps jusqu'à la hanche. Travaille chaque côté du dos de façon unilatérale. 3 séries de 10 répétitions par bras." },
    { categorie: "dos", title: "Soulevé de terre", description: "Pieds à largeur de hanches, dos plat, soulevez la barre du sol jusqu'à l'extension complète des hanches. Mouvement polyarticulaire complet qui renforce toute la chaîne postérieure. 4 séries de 5 répétitions." },
    // Jambes
    { categorie: "jambes", title: "Squat à la barre", description: "Barre sur les trapèzes, descendez les hanches sous le niveau des genoux en gardant le dos droit, puis remontez. Exercice fondamental pour les quadriceps et les fessiers. 4 séries de 8 répétitions." },
    { categorie: "jambes", title: "Presse à cuisses inclinée", description: "Assis dans la machine, poussez le chariot avec les pieds à largeur d'épaules sans verrouiller les genoux. Permet de charger lourd en sécurité. 4 séries de 10 à 12 répétitions." },
    { categorie: "jambes", title: "Fentes marchées avec haltères", description: "Un haltère dans chaque main, avancez en fente en descendant le genou arrière près du sol. Excellent pour l'équilibre, les quadriceps et les fessiers. 3 séries de 12 pas par jambe." },
    { categorie: "jambes", title: "Leg curl allongé", description: "Allongé sur la machine, ramenez les talons vers les fessiers en contractant les ischio-jambiers. Isolation de l'arrière de la cuisse. 3 séries de 12 répétitions." },
    { categorie: "jambes", title: "Extensions mollets debout", description: "Debout sur une marche, montez sur la pointe des pieds le plus haut possible puis redescendez lentement. 4 séries de 15 à 20 répétitions." },
    { categorie: "jambes", title: "Hip thrust à la barre", description: "Dos en appui sur un banc, barre sur les hanches, poussez le bassin vers le haut en contractant les fessiers. Le meilleur exercice d'isolation des fessiers. 4 séries de 10 répétitions." },
    // Épaules
    { categorie: "epaules", title: "Développé militaire", description: "Debout, poussez la barre depuis les clavicules jusqu'au-dessus de la tête en gardant le tronc gainé. Exercice de base pour la force des épaules. 4 séries de 8 répétitions." },
    { categorie: "epaules", title: "Élévations latérales aux haltères", description: "Debout, montez les haltères sur les côtés jusqu'à l'horizontale, coudes légèrement fléchis. Cible le faisceau moyen du deltoïde pour élargir les épaules. 4 séries de 12 à 15 répétitions." },
    { categorie: "epaules", title: "Élévations frontales", description: "Montez alternativement chaque haltère devant vous jusqu'à hauteur des yeux. Isole le faisceau antérieur du deltoïde. 3 séries de 12 répétitions." },
    { categorie: "epaules", title: "Oiseau buste penché", description: "Buste penché en avant, ouvrez les bras sur les côtés en serrant les omoplates. Renforce l'arrière des épaules et améliore la posture. 3 séries de 15 répétitions." },
    { categorie: "epaules", title: "Tirage menton à la barre", description: "Debout, tirez la barre le long du corps jusqu'au menton, coudes vers le haut. Sollicite les deltoïdes et les trapèzes. 3 séries de 10 répétitions." },
    // Bras
    { categorie: "bras", title: "Curl biceps à la barre", description: "Debout, coudes fixés au corps, montez la barre vers les épaules en contractant les biceps. L'exercice de référence pour les biceps. 4 séries de 10 répétitions." },
    { categorie: "bras", title: "Curl marteau", description: "Haltères en prise neutre, montez alternativement chaque bras. Développe le brachial et l'avant-bras pour des bras plus épais. 3 séries de 12 répétitions." },
    { categorie: "bras", title: "Curl incliné aux haltères", description: "Assis sur un banc incliné, bras pendants, effectuez un curl complet avec un fort étirement du biceps en bas. 3 séries de 10 répétitions." },
    { categorie: "bras", title: "Extensions triceps à la poulie haute", description: "Face à la poulie, coudes collés au corps, poussez la corde vers le bas jusqu'à l'extension complète. Isolation efficace des triceps. 4 séries de 12 répétitions." },
    { categorie: "bras", title: "Barre au front", description: "Allongé sur un banc, descendez la barre EZ vers le front en fléchissant uniquement les coudes, puis tendez les bras. Cible la longue portion du triceps. 3 séries de 10 répétitions." },
    { categorie: "bras", title: "Dips entre deux bancs", description: "Mains sur un banc derrière vous, pieds sur un autre, fléchissez les coudes pour descendre le bassin puis repoussez. Exercice triceps accessible à tous. 3 séries de 12 à 15 répétitions." },
    // Abdos
    { categorie: "abdos", title: "Crunch au sol", description: "Allongé sur le dos, genoux fléchis, enroulez le buste vers les genoux en soufflant. Exercice de base pour le grand droit de l'abdomen. 4 séries de 20 répétitions." },
    { categorie: "abdos", title: "Gainage planche", description: "En appui sur les avant-bras et les pointes de pieds, maintenez le corps parfaitement aligné. Renforce toute la sangle abdominale en profondeur. 4 séries de 45 à 60 secondes." },
    { categorie: "abdos", title: "Relevé de jambes suspendu", description: "Suspendu à la barre fixe, montez les jambes tendues jusqu'à l'horizontale sans balancer. Cible le bas des abdominaux. 3 séries de 12 répétitions." },
    { categorie: "abdos", title: "Russian twist lesté", description: "Assis, buste incliné en arrière, pieds décollés, effectuez des rotations du tronc avec un poids. Travaille les obliques. 3 séries de 20 rotations." },
    { categorie: "abdos", title: "Gainage latéral", description: "En appui sur un avant-bras, corps aligné de profil, maintenez la position sans laisser tomber la hanche. Renforce les obliques et stabilise le tronc. 3 séries de 30 secondes par côté." },
    // Cardio
    { categorie: "cardio", title: "Burpees", description: "Enchaînez squat, planche, pompe puis saut vertical le plus rapidement possible. Exercice cardio complet au poids du corps. 4 séries de 15 répétitions." },
    { categorie: "cardio", title: "Mountain climbers", description: "En position de planche, ramenez alternativement les genoux vers la poitrine à un rythme rapide. Cardio et gainage combinés. 4 séries de 30 secondes." },
    { categorie: "cardio", title: "Corde à sauter", description: "Sautez à la corde en gardant un rythme régulier, sur la pointe des pieds. Excellent pour le cardio, la coordination et les mollets. 5 séries de 60 secondes." },
    { categorie: "cardio", title: "Rameur", description: "Tirez la poignée en poussant d'abord sur les jambes puis en finissant avec le dos et les bras. Cardio complet qui sollicite 80 % des muscles. 15 à 20 minutes en fractionné." },
    { categorie: "cardio", title: "Sprint sur tapis", description: "Alternez 30 secondes de sprint à intensité maximale et 60 secondes de marche de récupération. Format HIIT très efficace pour brûler des calories. 8 à 10 cycles." },
    // Étirements
    { categorie: "etirements", title: "Étirement des ischio-jambiers", description: "Assis jambes tendues, penchez le buste vers l'avant en gardant le dos droit jusqu'à sentir l'étirement derrière les cuisses. Maintenez 30 secondes, 3 fois." },
    { categorie: "etirements", title: "Étirement des quadriceps debout", description: "Debout, attrapez votre cheville derrière vous et amenez le talon vers le fessier en gardant les genoux serrés. Maintenez 30 secondes par jambe." },
    { categorie: "etirements", title: "Étirement des épaules et pectoraux", description: "Bras tendu contre un mur ou un cadre de porte, tournez lentement le buste du côté opposé pour ouvrir la poitrine. Maintenez 30 secondes par côté." },
    { categorie: "etirements", title: "Posture de l'enfant", description: "À genoux, asseyez-vous sur les talons et allongez les bras loin devant vous en relâchant le dos. Idéal pour détendre la colonne en fin de séance. Maintenez 60 secondes." },
];

// =====================================================================
// 4. Programmes réels (40) — chaque programme cible des groupes
//    musculaires précis, dont sont tirés ses exercices (5 à 10).
// =====================================================================
type ProgramSeed = { title: string; description: string; categories: Categorie[] };

const PROGRAMS: ProgramSeed[] = [
    { title: "Push Pull Legs — Débutant", description: "Une rotation classique sur 3 séances : poussée (pectoraux, épaules, triceps), tirage (dos, biceps) et jambes. Idéal pour structurer sa semaine quand on débute la musculation.", categories: ["pectoraux", "dos", "jambes", "epaules", "bras"] },
    { title: "Full Body 3 séances", description: "Tout le corps travaillé à chaque séance, 3 fois par semaine. Parfait pour progresser rapidement avec un volume maîtrisé et une bonne récupération.", categories: ["pectoraux", "dos", "jambes", "epaules", "abdos"] },
    { title: "Prise de masse — Haut du corps", description: "Un programme axé hypertrophie pour développer pectoraux, dos, épaules et bras avec des charges progressives et un volume élevé.", categories: ["pectoraux", "dos", "epaules", "bras"] },
    { title: "Sèche estivale", description: "Circuit combinant exercices polyarticulaires et cardio HIIT pour maximiser la dépense calorique tout en préservant la masse musculaire avant l'été.", categories: ["cardio", "abdos", "jambes", "pectoraux"] },
    { title: "Force athlétique — Cycle 1", description: "Premier cycle de force centré sur le squat, le développé couché et le soulevé de terre. Charges lourdes, peu de répétitions, progression linéaire sur 6 semaines.", categories: ["jambes", "pectoraux", "dos"] },
    { title: "Spécial pectoraux", description: "Séance de spécialisation pour rattraper un point faible : tous les angles des pectoraux sont travaillés, du développé couché aux écartés.", categories: ["pectoraux", "bras"] },
    { title: "Dos d'acier", description: "Tractions, rowing et tirages pour construire un dos large et épais, améliorer la posture et protéger la colonne vertébrale.", categories: ["dos", "bras"] },
    { title: "Jambes en béton", description: "Squat, presse, fentes et travail des mollets : une séance jambes complète et exigeante pour développer force et volume du bas du corps.", categories: ["jambes", "abdos"] },
    { title: "Épaules 3D", description: "Les trois faisceaux du deltoïde travaillés sous tous les angles pour des épaules rondes et larges qui donnent la carrure.", categories: ["epaules", "bras"] },
    { title: "Bras volumineux", description: "Superset biceps-triceps pour un maximum de congestion. La séance idéale à ajouter en fin de semaine pour faire grossir les bras.", categories: ["bras", "epaules"] },
    { title: "Abdos visibles en 8 semaines", description: "Un travail complet de la sangle abdominale combiné à du cardio pour révéler les abdominaux : crunchs, gainage, obliques et HIIT.", categories: ["abdos", "cardio"] },
    { title: "Cardio HIIT express", description: "20 minutes chrono d'entraînement fractionné à haute intensité : burpees, mountain climbers et sprints pour brûler un maximum de calories.", categories: ["cardio", "abdos"] },
    { title: "Remise en forme douce", description: "Reprise progressive de l'activité physique avec des exercices simples au poids du corps et des étirements. Aucun matériel requis.", categories: ["abdos", "etirements", "cardio"] },
    { title: "Programme débutant salle", description: "Vos 8 premières semaines en salle de sport : les mouvements de base sur machines et charges libres pour apprendre les bons gestes en sécurité.", categories: ["pectoraux", "dos", "jambes", "epaules"] },
    { title: "Home workout sans matériel", description: "Entraînement complet à la maison uniquement au poids du corps : pompes, gainage, fentes et cardio, sans aucun équipement.", categories: ["pectoraux", "abdos", "cardio", "jambes"] },
    { title: "Circuit training brûle-graisse", description: "Enchaînement de 6 à 8 ateliers sans temps de repos pour garder un rythme cardiaque élevé et transformer la séance en fournaise calorique.", categories: ["cardio", "jambes", "abdos", "pectoraux"] },
    { title: "Powerlifting — Les 3 mouvements", description: "Programme dédié à la performance sur squat, développé couché et soulevé de terre, avec exercices d'assistance ciblés.", categories: ["jambes", "pectoraux", "dos"] },
    { title: "Endurance musculaire", description: "Séries longues et temps de repos courts pour améliorer la résistance des muscles à l'effort prolongé. Idéal en complément d'un sport d'endurance.", categories: ["jambes", "abdos", "cardio", "dos"] },
    { title: "Préparation physique football", description: "Explosivité, gainage et renforcement du bas du corps pour gagner en vitesse et réduire le risque de blessure sur le terrain.", categories: ["jambes", "abdos", "cardio"] },
    { title: "Préparation physique running", description: "Renforcement musculaire spécifique coureur : jambes, mollets, gainage et étirements pour améliorer la foulée et prévenir les blessures.", categories: ["jambes", "abdos", "etirements"] },
    { title: "Upper / Lower 4 jours", description: "Alternance haut du corps et bas du corps sur 4 séances par semaine : la structure idéale pour concilier fréquence et récupération.", categories: ["pectoraux", "dos", "jambes", "epaules", "bras"] },
    { title: "Split 5 jours — Bodybuilding", description: "Un groupe musculaire par jour pour un volume d'entraînement maximal sur chaque muscle, à la manière des bodybuilders classiques.", categories: ["pectoraux", "dos", "jambes", "epaules", "bras"] },
    { title: "Spécial bas du corps — Fessiers", description: "Hip thrust, fentes et squats : un programme centré sur le développement des fessiers et des cuisses, avec accent sur la chaîne postérieure.", categories: ["jambes", "abdos"] },
    { title: "Gainage et posture", description: "Renforcement profond du tronc et de l'arrière des épaules pour corriger la posture, soulager le dos et gagner en stabilité.", categories: ["abdos", "epaules", "etirements"] },
    { title: "Mobilité et étirements", description: "Séance complète d'assouplissement pour gagner en amplitude articulaire, mieux récupérer et prévenir les blessures.", categories: ["etirements", "abdos"] },
    { title: "Récupération active", description: "Séance légère entre deux entraînements intenses : cardio doux et étirements pour favoriser la circulation et accélérer la récupération.", categories: ["etirements", "cardio"] },
    { title: "Explosivité et puissance", description: "Mouvements explosifs et charges modérées déplacées à vitesse maximale pour développer la puissance athlétique.", categories: ["jambes", "cardio", "dos"] },
    { title: "Programme senior — Maintien", description: "Exercices adaptés pour entretenir la masse musculaire, l'équilibre et la souplesse après 60 ans, en toute sécurité.", categories: ["jambes", "abdos", "etirements"] },
    { title: "Retour de blessure — Reprise", description: "Réathlétisation progressive avec charges légères, travail de gainage et étirements pour retrouver ses sensations sans risque.", categories: ["etirements", "abdos", "jambes"] },
    { title: "Volume pectoraux-triceps", description: "Séance push orientée hypertrophie : les pectoraux en exercices de base puis les triceps en isolation pour finir la congestion.", categories: ["pectoraux", "bras"] },
    { title: "Dos-biceps intense", description: "Séance pull à haut volume : tractions et rowings lourds suivis d'un travail de biceps complet. La paire classique du split.", categories: ["dos", "bras"] },
    { title: "Deltoïdes et trapèzes", description: "Développés, élévations et tirages menton pour élargir les épaules et épaissir les trapèzes : la clé d'une silhouette imposante.", categories: ["epaules", "dos"] },
    { title: "Cuisses-fessiers intensif", description: "La séance bas du corps la plus dure du programme : squats lourds, presse à fond et fentes jusqu'à l'échec. Réservé aux motivés.", categories: ["jambes"] },
    { title: "Core stability", description: "Gainage dynamique et statique sous toutes ses formes pour un tronc solide, base de tous les mouvements sportifs.", categories: ["abdos", "etirements"] },
    { title: "Cardio-boxe fitness", description: "Un entraînement cardio inspiré de la boxe : enchaînements rapides, corde à sauter et gainage pour se défouler en brûlant des calories.", categories: ["cardio", "abdos", "epaules"] },
    { title: "Cross training WOD", description: "Workout of the day à la croisée de la force et du cardio : soulevés de terre, burpees et rameur enchaînés contre la montre.", categories: ["dos", "cardio", "jambes"] },
    { title: "Programme étudiant — 30 minutes", description: "Séances courtes et efficaces pensées pour les emplois du temps chargés : l'essentiel du renforcement en une demi-heure.", categories: ["pectoraux", "jambes", "abdos"] },
    { title: "Machines uniquement — Débutant", description: "Un circuit 100 % machines guidées pour se muscler en toute sécurité quand on découvre la salle de sport.", categories: ["jambes", "dos", "pectoraux", "bras"] },
    { title: "Haltères uniquement", description: "Programme complet réalisable avec une simple paire d'haltères, à la maison comme en salle : développés, rowings, fentes et curls.", categories: ["pectoraux", "dos", "jambes", "epaules", "bras"] },
    { title: "Défi 30 jours full body", description: "Un mois de séances quotidiennes courtes et progressives pour créer une habitude d'entraînement durable et transformer sa condition physique.", categories: ["pectoraux", "jambes", "abdos", "cardio"] },
];

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

    // 0. Images de test copiées dans /uploads
    const imageUrls = copySeedImages();
    console.log(`${Object.keys(imageUrls).length} images de test copiées dans ${UPLOAD_DIR}.`);

    // 1. Utilisateurs (mot de passe hashé via bcrypt -> connexion possible)
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const users = await UserModel.insertMany(
        [...MAIN_USERS, ...EXTRA_USERS].map((u) => ({ ...u, password: hashedPassword }))
    );
    const mainUsers = users.slice(0, MAIN_USERS.length);
    const userIds = users.map((u) => u._id);
    console.log(
        `${users.length} utilisateurs créés (mot de passe: "${DEFAULT_PASSWORD}", identifiants principaux dans SEED_LOGINS.md).`
    );

    // 2. Exercices (durée en timestamp ms, max 2h + image de test)
    const exercices = await ExerciceModel.insertMany(
        EXERCICES.map((e) => ({
            title: e.title,
            description: e.description,
            time: randomExerciceTime(),
            imageUrl: imageUrls[e.categorie],
        }))
    );
    console.log(`${exercices.length} exercices créés.`);

    // Index des exercices par catégorie pour composer des programmes cohérents
    const exercicesByCategorie = new Map<Categorie, typeof exercices>();
    exercices.forEach((doc, i) => {
        const categorie = EXERCICES[i].categorie;
        const list = exercicesByCategorie.get(categorie) ?? [];
        list.push(doc);
        exercicesByCategorie.set(categorie, list);
    });

    // 3. Programmes (5 à 10 exercices tirés des catégories ciblées)
    const coachAndAdminIds = users
        .filter((u) => u.role !== UserRole.USER)
        .map((u) => u._id);

    const programs = await ProgramModel.insertMany(
        PROGRAMS.map((p) => {
            const pool = p.categories.flatMap(
                (categorie) => exercicesByCategorie.get(categorie) ?? []
            );
            const count = Math.min(rand(5, 10), pool.length);
            return {
                title: p.title,
                description: p.description,
                user: pick(coachAndAdminIds),
                exercices: pickMany(pool.map((e) => e._id), count),
            };
        })
    );
    console.log(`${programs.length} programmes créés.`);

    // 4. Notes (référence user + program, note 0-20)
    const notes = await NoteModel.insertMany(
        Array.from({ length: 60 }, () => ({
            note: rand(8, 20),
            program: pick(programs)._id,
            user: pick(userIds),
        }))
    );
    console.log(`${notes.length} notes créées.`);

    // 5. Favoris — chaque utilisateur principal a au moins 5 favoris,
    //    puis quelques favoris aléatoires pour les autres utilisateurs.
    //    Index unique (user, program) -> paires uniques garanties.
    const favorisPairs = new Map<string, { user: any; program: any }>();
    const addFavori = (user: any, program: any) => {
        const key = `${user}_${program}`;
        if (!favorisPairs.has(key)) favorisPairs.set(key, { user, program });
    };

    for (const user of mainUsers) {
        for (const program of pickMany(programs, rand(5, 8))) {
            addFavori(user._id, program._id);
        }
    }
    let attempts = 0;
    while (favorisPairs.size < mainUsers.length * 5 + 15 && attempts < 200) {
        attempts++;
        addFavori(pick(userIds), pick(programs)._id);
    }
    const favoris = await FavorisModel.insertMany([...favorisPairs.values()]);
    console.log(`${favoris.length} favoris créés.`);

    // 6. Historiques — chaque utilisateur principal a au moins 5 séances
    //    TERMINÉES avec des poids différents (progression simulée),
    //    puis un volume d'historiques aléatoires pour les autres.
    const historyDocs: {
        userId: any;
        programId: any;
        start: Date;
        end: Date | null;
        weight: number | null;
    }[] = [];

    for (const user of mainUsers) {
        const sessions = rand(5, 8);
        // Poids de départ autour du poids de l'utilisateur, qui évolue séance après séance
        let weight = user.weight + rand(-2, 2);
        for (let i = 0; i < sessions; i++) {
            // Séances réparties dans le passé, la plus ancienne en premier
            const start = new Date(
                Date.now() - (sessions - i) * rand(3, 6) * 24 * 60 * 60 * 1000
            );
            const end = new Date(start.getTime() + rand(30, 90) * 60 * 1000);
            // Variation de poids à chaque séance -> plusieurs poids différents
            weight = Math.round((weight + (Math.random() * 1.6 - 0.9)) * 10) / 10;
            historyDocs.push({
                userId: user._id,
                programId: pick(programs)._id,
                start,
                end,
                weight,
            });
        }
    }

    // Historiques aléatoires supplémentaires (certains en cours, sans fin)
    for (let i = 0; i < 30; i++) {
        const start = randomDate(90);
        const hasEnded = Math.random() < 0.85;
        historyDocs.push({
            userId: pick(userIds),
            programId: pick(programs)._id,
            start,
            end: hasEnded ? new Date(start.getTime() + rand(15, 90) * 60 * 1000) : null,
            weight: hasEnded ? rand(45, 110) : null,
        });
    }

    const histories = await HistoryModel.insertMany(historyDocs);
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
