
export const ENUMRole = {
    USER: 1,
    ADMIN: 1000000
}


export type Role = 1 | 100000 | 1000000

// @Entity
export class User {
    id: string;

    role: Role
    username: string;
    passwordEnc: string;

    purchaseAssetId: string[];
    isDeleted: boolean;

    createdAt: number;
    editedAt: number;
}