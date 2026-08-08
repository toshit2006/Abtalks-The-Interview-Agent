import { neon } from "@neondatabase/serverless";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export type DbSession = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export type DbInterviewHistory = {
  id: string;
  user_id: string;
  session_id: string;
  candidate_name: string;
  job_role: string;
  overall_score: number;
  results_json: string;
  feedback_json: string;
  created_at: string;
};

let dbInitialized = false;

export function getDb() {
  const connectionString = process.env["POSTGRES_URL"]?.trim();
  if (!connectionString) return null;
  try {
    return neon(connectionString);
  } catch (err) {
    console.error("Failed to initialize Neon Postgres client:", err);
    return null;
  }
}

/** Automatically initializes PostgreSQL schema tables if they do not exist yet. */
export async function initDbSchema() {
  if (dbInitialized) return;
  const sql = getDb();
  if (!sql) return;

  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'candidate',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Auth Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Interview History table
    await sql`
      CREATE TABLE IF NOT EXISTS interview_history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(64) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        job_role VARCHAR(255) NOT NULL,
        overall_score INT NOT NULL,
        results_json TEXT NOT NULL,
        feedback_json TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    dbInitialized = true;
    console.log("PostgreSQL schema tables verified/created successfully.");
  } catch (err) {
    console.error("PostgreSQL table init error:", err);
  }
}

/** Simple Web Crypto SHA-256 password hash */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "ia_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
