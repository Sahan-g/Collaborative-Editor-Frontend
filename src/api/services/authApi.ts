import { SERVICES } from "../../constants/services";
import type { RegisterResponse, LoginData, LoginResponse } from "../../types/auth";
import axiosInstance from "./axiosInstance";

import type { AxiosResponse } from "axios";

export const authApi = {
  login: (payload: LoginData): Promise<AxiosResponse<LoginResponse>> =>
    axiosInstance.post<LoginResponse>(`${SERVICES.AUTH.url}/login`, payload),

  register: (payload: LoginData): Promise<AxiosResponse<RegisterResponse>> =>
    axiosInstance.post<RegisterResponse>(`${SERVICES.AUTH.url}/register`, payload),
};


