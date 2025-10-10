import { API_URL } from "../config/config";
import type { UserResponse } from "../types/user";
import axiosClient from "../utils/axiosClient";

export const userApi = {
    getProfile: async (): Promise<UserResponse> => {
        const response = await axiosClient.get<UserResponse>(`${API_URL}/users/profile`);
        return response.data
    }
}