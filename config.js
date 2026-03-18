export const DB_CONFIG = {
  host: process.env.DB_HOST || "mysql",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "marticvet",
  password: process.env.DB_PASSWORD || "Marticvet7927@",
  database: process.env.DB_NAME || "tire_shop_idea2",
};

export const PORT = process.env.PORT || 3030;

export const PRIVATE_KEY = 'secret_key';

// 60 mins * 60 secs
export const TOKEN_LIFETIME = 60 * 60;