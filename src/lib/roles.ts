export const ROLES = ['CCRO','CCO','CAO','MD'] as const;
export type Role = typeof ROLES[number];


export const nextStage: Record<Role, Role | null> = {
CCRO: 'CCO',
CCO: 'CAO',
CAO: 'MD',
MD: null,
};