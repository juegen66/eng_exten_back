

export interface EmailService {
    /**
     * 发送 OTP 验证码邮件
     * @param email 收件人邮箱
     * @param otp OTP 验证码
     * @param type OTP 类型：sign-in（登录）、email-verification（邮箱验证）、forget-password（忘记密码）
     */
    sendOTP(email: string, otp: string, type: 'sign-in' | 'email-verification' | 'forget-password'): Promise<void>
}


export class DefaultEmailService implements EmailService {
    async sendOTP(email: string, otp: string, type: 'sign-in' | 'email-verification' | 'forget-password'): Promise<void> {
        // TODO: 实现实际的邮件发送逻辑


        const subjectMap = {
            'sign-in': '登录验证码',
            'email-verification': '邮箱验证码',
            'forget-password': '密码重置验证码'
        }

        const contentMap = {
            'sign-in': `您的登录验证码是：${otp}，有效期 5 分钟。`,
            'email-verification': `您的邮箱验证码是：${otp}，有效期 5 分钟。`,
            'forget-password': `您的密码重置验证码是：${otp}，有效期 5 分钟。`
        }


        console.log('📧 Email OTP:', {
            to: email,
            type,
            otp,
            subject: subjectMap[type],
            content: contentMap[type]
        })

        // TODO: 在生产环境中实现实际的邮件发送逻辑
        // 示例：使用 Resend（需要在 wrangler.jsonc 中配置 RESEND_API_KEY）
        // 
        // const RESEND_API_KEY = env.RESEND_API_KEY
        // if (!RESEND_API_KEY) {
        //   throw new Error('RESEND_API_KEY is not configured')
        // }
        // 
        // const response = await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${RESEND_API_KEY}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     from: 'noreply@yourdomain.com',
        //     to: email,
        //     subject: subjectMap[type],
        //     html: `<p>${contentMap[type]}</p>`,
        //   }),
        // })
        // 
        // if (!response.ok) {
        //   const error = await response.text()
        //   throw new Error(`Failed to send email: ${response.statusText} - ${error}`)
        // }
    }
}

// 导出单例实例
let emailServiceInstance: EmailService | null = null

/**
 * 初始化邮件服务
 */
export function initializeEmailService(service?: EmailService): void {
    emailServiceInstance = service || new DefaultEmailService()
}

/**
 * 获取邮件服务实例
 */
export function getEmailService(): EmailService {
    if (!emailServiceInstance) {
        emailServiceInstance = new DefaultEmailService()
    }
    return emailServiceInstance
}

