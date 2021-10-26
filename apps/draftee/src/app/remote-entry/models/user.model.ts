export class User {
    id!: number;
    username!: string;
    access_token?: string;
    token_type!: string;
    roles: any;
    // refresh_token;
}