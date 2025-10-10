export interface ConversationResponse {
     status: number;
        message: string;
        data: {
            total: number;
            page: number;
            limit: number;
            data: Conversation[];
        };
}

export interface Conversation {
    user_id: string,
    display_name: string,
    avatar: string,
    last_message: string,
    last_date: string,
    unread_count: number
}