import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Client } from "pg";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set! Exiting...");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL database");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

connectDB();

process.on("SIGINT", async () => {
  console.log("🔴 Shutting down...");
  await client.end();
  process.exit(0);
});

app.use(cors({ origin: clientURL, methods: "GET,POST,PATCH,PUT,DELETE" }));
app.use(express.json());

app.get("/users", async (_req: Request, res: Response) => {
  try {
    const result = await client.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Could not fetch users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/users", async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  try {
    const result = await client.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Could not add user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
