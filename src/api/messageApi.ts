import { API_URL } from "../config/config";
import type { MessageResponse } from "../types/Message";
import axiosClient from "../utils/axiosClient";

export const messageAPI = {
    getMessage: async (renderId: string, groupID: string, limit: number, skip: number): Promise<MessageResponse> => {
        const response = await axiosClient.get<MessageResponse>(`${API_URL}/message/get-message`, {
            params: {
                receiver_id: renderId,
                group_id: groupID,
                limit: limit,
                skip:skip
            }
        } );

        return response.data;
    }
}