
import { Sequelize } from "sequelize";
const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const port = Number(process.env.MYSQL_PORT) || 3306;
if (!database || !user || !host) {
    throw new Error("Missing MySQL environment variables");
}
export const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: "mysql",
    logging: false, // disable SQL logs, optional
});
export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("MySQL connected successfully");
    }
    catch (err) {
        console.error("Unable to connect to MySQL:", err);
        process.exit(1);
    }
}
