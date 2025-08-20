export interface LoginData {
    email: string;
    password: string;
}

export type RegisterResponse = { id: string, emailResponse: string };
export type LoginResponse = { token: string };