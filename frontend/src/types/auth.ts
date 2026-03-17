export type User = {
    id: string;
    email: string;
    name: string;
}

export type AuthResponse = {
    token: string;
    user: User;
}