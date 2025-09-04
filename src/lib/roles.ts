export const ROLES = ['CCRO','HCC','BM','RH','RA','IA','CIA','MD'] as const;
export type Role = typeof ROLES[number];


export const nextStage: Record<Role, Role | null> = {
    CCRO: "HCC",
    HCC:  "BM",
    BM:   "RH",
    RH:   "RA",
    RA:   "IA",
    IA:   "CIA",
    CIA:  "MD",
    MD:   null,
};