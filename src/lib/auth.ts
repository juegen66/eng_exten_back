import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "../data/schema/database";
import * as authSchema from "../data/schema/auth-schema";
import type { Auth } from "better-auth";
import { emailOTP, bearer } from "better-auth/plugins";
import { getEmailService } from "../core/email.service";

// Store auth instance for runtime
let authInstance: Auth | null = null;

/**
 * Initialize Better Auth instance
 * This function should be called once during application startup
 * Uses Cloudflare D1 database via drizzle-orm/d1
 */
export const initializeAuth = (d1: D1Database, secret: string, baseURL: string): Auth => {
    if (!authInstance) {
        const db = getDatabase(d1);
        const emailService = getEmailService();

        authInstance = betterAuth({
            trustedOrigins: ["chrome-extension://homgfompjgbdfpiiaimnohpnaidgmjmp", "chrome-extension://*"],
            database: drizzleAdapter(db, {
                provider: "sqlite",
                schema: authSchema,
            }),
            secret,
            baseURL,
            sessionExpiresIn: 60 * 60 * 24 * 365,            // 30 days
            emailAndPassword: {
                enabled: true,
            },
            plugins: [
                emailOTP({
                    // 实现 sendVerificationOTP 方法来发送 OTP 邮件
                    async sendVerificationOTP({ email, otp, type }) {
                        try {
                            if (type === "sign-in") {
                                // 发送登录验证码
                                await emailService.sendOTP(email, otp, type);
                            } else if (type === "email-verification") {
                                // 发送邮箱验证码
                                await emailService.sendOTP(email, otp, type);
                            } else {
                                // 发送密码重置验证码
                                await emailService.sendOTP(email, otp, type);
                            }
                        } catch (error) {
                            console.error('Failed to send OTP email:', error);
                            throw error;
                        }
                    },
                    // 可选配置
                    otpLength: 6, // OTP 长度，默认 6 位
                    expiresIn: 300, // OTP 过期时间（秒），默认 300 秒（5 分钟）
                    allowedAttempts: 3, // 最大尝试次数，默认 3 次
                    // disableSignUp: false, // 是否禁止自动注册，默认 false
                    // sendVerificationOnSignUp: false, // 注册时是否发送验证码，默认 false
                }),
                bearer()
            ],
        });
    }

    return authInstance;
};

/**
 * Get the initialized Better Auth instance
 * Throws an error if auth has not been initialized
 */
export const getAuth = (): Auth => {
    if (!authInstance) {
        throw new Error('Better Auth not initialized. Call initializeAuth() first.');
    }
    return authInstance;
};

