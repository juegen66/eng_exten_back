import type { SuccessResponse, ErrorResponse } from '../types/response.type'


export const createSuccessResponse = (data: any, message: string = '操作成功'): SuccessResponse => {
    return {
        code: 200,
        message: message,
        data: data
    }
}

export const createErrorResponse = (message: string, data: any = null): ErrorResponse => {
    return {
        code: 500,
        message: message,
        data: data
    }
}

// 保持向后兼容
export const successResponse = createSuccessResponse
export const errorResponse = createErrorResponse
