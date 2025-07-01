export const env_config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/your-db-name",
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    SMTP_USER: process.env.SMTP_USER || "your-email@gmail.com",
    SMTP_PASS: process.env.SMTP_PASS || "your-email-password",
    ERROR_EMAIL_RECEIVER: process.env.ERROR_EMAIL_RECEIVER || "your-email@gmail.com",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
    CACHE_TTL:process.env.CACHE_TTL || 300,
    Fronted_URL:process.env.frontend_URL || "http://localhost:5173",
    Backend_URL:process.env.BACKEND_URL || "http://localhost:3000"
}

