const nodeEnv = process.env.NODE_ENV || "development";
const defaultDataSource = nodeEnv === "test" ? "memory" : "mysql";
const dataSource = process.env.DATA_SOURCE || defaultDataSource;

if (!["mysql", "json", "memory"].includes(dataSource)) {
    throw new Error(
        `Unsupported DATA_SOURCE "${dataSource}". Use "mysql", "json", or "memory".`
    );
}

if (nodeEnv !== "test" && dataSource === "memory") {
    throw new Error(
        'Non-test environments cannot use DATA_SOURCE="memory". Use "mysql" or "json".'
    );
}

const env = {
    nodeEnv,
    port: Number(process.env.API_PORT || process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || "talent-flow-local-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRY || process.env.JWT_EXPIRES_IN || "2h",
    uploadDir: process.env.UPLOAD_DIR || "uploads/submissions",
    dataSource,
    corsOrigins: String(process.env.CORS_ORIGINS || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 180),
    authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
    mysqlHost: process.env.MYSQL_HOST || "127.0.0.1",
    mysqlPort: Number(process.env.MYSQL_PORT || 3306),
    mysqlUser: process.env.MYSQL_USER || "root",
    mysqlPassword: process.env.MYSQL_PASSWORD || "",
    mysqlDatabase: process.env.MYSQL_DATABASE || "talent_flow",
    mysqlImportJson:
        String(process.env.MYSQL_IMPORT_JSON || "true").toLowerCase() !== "false"
};

export {
    env
};
