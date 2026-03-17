import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "gemcam.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(DATA_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      original_drive_id TEXT NOT NULL,
      generated_drive_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return _db;
}

export interface ImageRow {
  id: string;
  original_drive_id: string;
  generated_drive_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function insertImage(id: string, originalDriveId: string): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO images (id, original_drive_id) VALUES (?, ?)"
  ).run(id, originalDriveId);
}

export function updateImageStatus(
  id: string,
  status: "completed" | "failed",
  generatedDriveId?: string,
  errorMessage?: string
): void {
  const db = getDb();
  db.prepare(
    `UPDATE images
     SET status = ?, generated_drive_id = ?, error_message = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(status, generatedDriveId ?? null, errorMessage ?? null, id);
}

export function getAllImageRows(): ImageRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM images ORDER BY created_at DESC")
    .all() as ImageRow[];
}

export function getImageRowById(id: string): ImageRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM images WHERE id = ?").get(id) as
    | ImageRow
    | undefined;
}
