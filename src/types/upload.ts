export interface UploadResponse {
    status: number;
    message: string;
    data: string[];
}

export interface Media {
    type: string;
    filename: string;
    size: number;
    url: string;
}