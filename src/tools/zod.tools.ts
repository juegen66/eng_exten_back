import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// 封装: 统一校验中间件
export const validate = <T extends z.ZodTypeAny>(type: 'json' | 'query' | 'param', schema: T) => {
    return zValidator(type, schema, (result, c) => {
        if (!result.success) {
            let errorMessage: string
            
            switch (type) {
                case 'json':
                    errorMessage = "Invalid request body"
                    break
                case 'query':
                    errorMessage = "Invalid request query"
                    break
                case 'param':
                    errorMessage = "Invalid request params"
                    break
                default:
                    errorMessage = "Invalid request data"
            }

            return c.json(
                {
                    error: errorMessage,
                    details: result.error.issues
                },
                400
            )
        }
    })
}

// 便捷的导出函数
export const validateJson = <T extends z.ZodTypeAny>(schema: T) => validate('json', schema)
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => validate('query', schema)
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => validate('param', schema)




