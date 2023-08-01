import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "postgres",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
