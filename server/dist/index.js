"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set! Exiting...");
    process.exit(1);
}
const client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL,
});
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log("✅ Connected to PostgreSQL database");
    }
    catch (error) {
        console.error("❌ Database connection error:", error);
        process.exit(1);
    }
});
connectDB();
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔴 Shutting down...");
    yield client.end();
    process.exit(0);
}));
app.use((0, cors_1.default)({ origin: clientURL, methods: "GET,POST,PATCH,PUT,DELETE" }));
app.use(express_1.default.json());
app.get("/users", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client.query("SELECT * FROM users");
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error("❌ Could not fetch users:", err);
        res.status(500).json({ error: "Database error" });
    }
}));
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
    }
    try {
        const result = yield client.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error("❌ Could not add user:", err);
        res.status(500).json({ error: "Database error" });
    }
}));
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
