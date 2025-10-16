// Import necessary packages
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

// Load environment variables from .env file
dotenv.config();

// Read database configuration from environment variables
const host = process.env.DB_HOST as string;       // Database server address (e.g., localhost)
const user = process.env.DB_USER as string;       // Database username
const password = process.env.DB_PASSWORD as string; // Database password
const database = process.env.DB_NAME as string;   // Database name
const port = Number(process.env.DB_PORT) || 3306; // Database port (default: 3306 for MySQL)

// Check if all required database settings are provided
if (!host || !user || !database) {
  console.error("Missing MySQL environment variables:");
  console.error({
    DB_HOST: host,
    DB_USER: user,
    DB_PASSWORD: password ? "*****" : "(empty)", // Hide password for security
    DB_NAME: database,
    DB_PORT: port,
  });
  throw new Error("Missing MySQL environment variables");
}

// Create a connection to the database using Sequelize
export const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql",  // We're using MySQL database
  logging: false,    // Set to true if you want to see SQL queries in console
});

// Function to test database connection
export async function connectDB() {
  try {
    await sequelize.authenticate(); // Try to connect to database
    console.log("MySQL connected successfully");
  } catch (err) {
    console.error("Unable to connect to MySQL:", err);
    process.exit(1); // Stop the server if database connection fails
  }
}

// Function to sync database tables with code models
export async function syncDB() {
  try {
    await sequelize.sync({ alter: true }); // Update tables to match models
    console.log("Models synchronized with DB");
  } catch (err) {
    console.error("Failed to sync DB:", err);
  }
}