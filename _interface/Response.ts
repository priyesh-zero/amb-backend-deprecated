
export interface SuccessResponse {
    status: true;
    data?: any
    message?: String;
}

export interface ErrorResponse {
    status: false;
    error: String;
}
