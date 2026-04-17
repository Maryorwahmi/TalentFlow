import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

import { collectionNames, defaultDatabase } from "./collections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_JSON_PATH = path.join(__dirname, "../../data/db.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getConfig() {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "talent_flow"
  };
}

function toRecord(row) {
  const payload = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  return {
    id: payload?.id ?? row.id,
    ...(payload || {})
  };
}

async function withDatabase(callback) {
  const config = getConfig();
  const bootstrap = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  const connection = await mysql.createConnection({
    ...config,
    multipleStatements: true
  });

  try {
    for (const tableName of collectionNames) {
      await connection.query(
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          id BIGINT NOT NULL PRIMARY KEY,
          data JSON NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
    }

    return await callback(connection);
  } finally {
    await connection.end();
  }
}

async function seedFromJsonIfNeeded(connection) {
  const [[row]] = await connection.query("SELECT COUNT(*) AS count FROM `users`");
  if (Number(row.count) > 0) {
    return false;
  }

  if (
    String(process.env.MYSQL_IMPORT_JSON || "true").toLowerCase() === "false" ||
    !fs.existsSync(DB_JSON_PATH)
  ) {
    return false;
  }

  const parsed = JSON.parse(fs.readFileSync(DB_JSON_PATH, "utf8"));

  for (const tableName of collectionNames) {
    const records = Array.isArray(parsed[tableName]) ? parsed[tableName] : [];
    for (const record of records) {
      const id = Number(record.id);
      if (!Number.isFinite(id)) {
        continue;
      }

      await connection.query(
        `INSERT INTO \`${tableName}\` (id, data) VALUES (?, CAST(? AS JSON))
         ON DUPLICATE KEY UPDATE data = VALUES(data)`,
        [id, JSON.stringify({ ...record, id })]
      );
    }
  }

  return true;
}

async function loadSnapshot(connection) {
  const snapshot = clone(defaultDatabase);
  snapshot.___metadata.updatedAt = new Date().toISOString();

  for (const tableName of collectionNames) {
    const [rows] = await connection.query(
      `SELECT id, data FROM \`${tableName}\` ORDER BY id ASC`
    );
    snapshot[tableName] = rows.map(toRecord);
  }

  return snapshot;
}

async function main() {
  const command = JSON.parse(process.argv[2] || "{}");

  const result = await withDatabase(async (connection) => {
    if (command.type === "init") {
      const imported = await seedFromJsonIfNeeded(connection);
      const snapshot = await loadSnapshot(connection);
      return { imported, snapshot };
    }

    if (command.type === "snapshot") {
      return loadSnapshot(connection);
    }

    if (command.type === "nextId") {
      const [[row]] = await connection.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM \`${command.table}\``
      );
      return { nextId: Number(row.nextId) };
    }

    if (command.type === "insert") {
      const id = Number(command.record.id);
      const record = { ...command.record, id };
      await connection.query(
        `INSERT INTO \`${command.table}\` (id, data) VALUES (?, CAST(? AS JSON))`,
        [id, JSON.stringify(record)]
      );
      return record;
    }

    if (command.type === "update") {
      const id = Number(command.id);
      const record = { ...command.record, id };
      await connection.query(
        `UPDATE \`${command.table}\` SET data = CAST(? AS JSON) WHERE id = ?`,
        [JSON.stringify(record), id]
      );
      return record;
    }

    if (command.type === "delete") {
      const id = Number(command.id);
      const [result] = await connection.query(
        `DELETE FROM \`${command.table}\` WHERE id = ?`,
        [id]
      );
      return { deleted: result.affectedRows > 0 };
    }

    throw new Error(`Unsupported MySQL exec command: ${command.type}`);
  });

  process.stdout.write(JSON.stringify(result));
}

main().catch((error) => {
  process.stderr.write(
    JSON.stringify({
      message: error.message,
      stack: error.stack
    })
  );
  process.exit(1);
});
