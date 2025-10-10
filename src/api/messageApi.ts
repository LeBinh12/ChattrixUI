import { API_URL } from "../config/config";
import type { MessageResponse } from "../types/Message";
import axiosClient from "../utils/axiosClient";

export const messageAPI = {
    getMessage: async (renderId: string): Promise<MessageResponse> => {
        const response = await axiosClient.get<MessageResponse>(`${API_URL}/message/get-message`, {
            params: {
                receiver_id: renderId
            }
        } );

        return response.data;
    }
}