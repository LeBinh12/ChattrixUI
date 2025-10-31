export interface GetAllGroupResponse {
    status: number;
    message: string;
    data: Group[];
}

export interface Group {
    id: string,
    created_at: string,
    updated_at: string,
    name: string,
    image: string,
    creator_id: string,
}