
const sslCertificate = process.env.DB_SSL_CA;

export const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "tires_shop_idea2",

  waitForConnections: true,
  connectionLimit: 5,

  ...(sslCertificate
    ? {
        ssl: {
          ca: sslCertificate.replace(/\\n/g, "\n"),
          rejectUnauthorized: true,
        },
      }
    : {}),
};

export const PORT = Number(process.env.PORT || 3030);
export const PRIVATE_KEY = process.env.JWT_SECRET;
export const TOKEN_LIFETIME = 60 * 60;
