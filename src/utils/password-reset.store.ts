import { randomBytes } from "crypto";

interface OtpEntry {
    hash: string;
    expiresAt: number;
    attempts: number;
    blockedUntil: number | null;
}

interface ResetTokenEntry {
    userId: string;
    email: string;
    expiresAt: number;
}

export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 3 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_BLOCK_DURATION_MS = 15 * 60 * 1000;

const otpStore = new Map<string, OtpEntry>();
const resetTokenStore = new Map<string, ResetTokenEntry>();

export const otpRepository = {
    set: (email: string, hash: string) => {
        otpStore.set(email, { hash, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, blockedUntil: null });
    },

    get: (email: string): OtpEntry | undefined => otpStore.get(email),

    clear: (email: string) => {
        otpStore.delete(email);
    },

    registerFailedAttempt: (email: string) => {
        const entry = otpStore.get(email);
        if (!entry) return;
        entry.attempts += 1;
        if (entry.attempts >= OTP_MAX_ATTEMPTS) {
            entry.blockedUntil = Date.now() + OTP_BLOCK_DURATION_MS;
        }
    },
};

export const resetTokenRepository = {
    create: (userId: string, email: string): string => {
        const token = randomBytes(32).toString("hex");
        resetTokenStore.set(token, { userId, email, expiresAt: Date.now() + RESET_TOKEN_TTL_MS });
        return token;
    },

    // Single-use: the entry is removed as soon as it's looked up, regardless of outcome.
    consume: (token: string): ResetTokenEntry | null => {
        const entry = resetTokenStore.get(token);
        if (!entry) return null;
        resetTokenStore.delete(token);
        if (entry.expiresAt < Date.now()) return null;
        return entry;
    },
};
