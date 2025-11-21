
export interface SuccessResponse {
    code: number
    message: string
    data: any | null
}

export interface ErrorResponse {
    code: number
    message: string
    data: any | null
}


export const successResponse = (message: string, data: any): SuccessResponse => {
    return {
        code: 200,
        message: message,
        data: data
    }
}

export const errorResponse = (message: string, data: any): ErrorResponse => {
    return {
        code: 400,
        message: message,
        data: data
    }
}
