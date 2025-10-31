import { API_URL } from "../config/config";
import type { GetAllGroupResponse } from "../types/group";
import axiosClient from "../utils/axiosClient";

export const groupApi = {
    getGroup: async (): Promise<GetAllGroupResponse> => {
        const response = await axiosClient.get<GetAllGroupResponse>(`${API_URL}/group/get-all`);
        return response.data
    },

    addGroup: async (formData: FormData) => {
        const response = await axiosClient.post(`${API_URL}/group/add`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    addMember: async (data: {
        group_id: string;
        user_id: string;
        role?: string;
    }) => {
        const response = await axiosClient.post(`${API_URL}/group/add-number`, data);
        return response.data;
    },
}