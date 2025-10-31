export interface UserResponse {
    status: number,
    message: string,
    data: {
        id: string;
        username: string;
        email: string;
        avatar: string;
        phone: string;
        display_name: string;
        birthday: string;
        gender: string;
        is_completed_friend_setup: boolean;
    }
}

export interface UserStatusResponse {
    status: number,
    message: string,
    data: UserStatus[],
}

export interface UserStatus {
    user_id: string;
    name: string;
    avatar: string;
    status: string;
    updated_at: string;
}