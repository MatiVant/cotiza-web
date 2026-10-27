import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "cotiza.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    due TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pendiente',
    source TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = (db.prepare("SELECT COUNT(*) AS count FROM quotes").get() as { count: number }).count;
if (count === 0) {
  const insert = db.prepare("INSERT INTO quotes (client, phone, description, amount, due, notes, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const seed = [
    ["Constructora Delta", "3415550101", "Estructura metálica para galpón", 1850000, "2026-11-07", "Entrega estimada: 30 días.", "pendiente", "demo"],
    ["Lucía Fernández", "3415550142", "Portón corredizo automatizado", 720000, "2026-11-05", "", "aceptado", "demo"],
    ["Metalúrgica Roldán", "3415550188", "Reparación de prensa hidráulica", 430000, "2026-11-04", "", "pendiente", "demo"]
  ];
  for (const row of seed) insert.run(...row);
}

export type Quote = { id: number; client: string; phone: string; description: string; amount: number; due: string; notes: string; status: string; source: string; created_at: string };
export function listQuotes(): Quote[] { return db.prepare("SELECT * FROM quotes ORDER BY id DESC").all() as unknown as Quote[]; }
export function createQuote(input: Omit<Quote, "id" | "created_at">) { const result = db.prepare("INSERT INTO quotes (client, phone, description, amount, due, notes, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(input.client, input.phone, input.description, input.amount, input.due, input.notes, input.status, input.source); return db.prepare("SELECT * FROM quotes WHERE id = ?").get(Number(result.lastInsertRowid)) as unknown as Quote; }
