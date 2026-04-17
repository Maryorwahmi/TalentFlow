import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { env } from "../shared/db/env.js";
import { defaultDatabase } from "./collections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../../data/db.json");
const MYSQL_EXEC_PATH = path.join(__dirname, "./mysql-exec.mjs");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class FileDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDatabase, null, 2));
      return clone(defaultDatabase);
    }

    const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    return { ...clone(defaultDatabase), ...parsed };
  }

  save() {
    this.data.___metadata = {
      ...(this.data.___metadata || {}),
      version: "3.0.0",
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  table(name) {
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  all(name) {
    return this.table(name);
  }

  findById(name, id) {
    return this.table(name).find((item) => String(item.id) === String(id)) || null;
  }

  nextId(name) {
    const table = this.table(name);
    return table.length === 0
      ? 1
      : Math.max(...table.map((item) => Number(item.id) || 0)) + 1;
  }

  insert(name, record) {
    const table = this.table(name);
    const created = {
      id: record.id ?? this.nextId(name),
      ...record
    };
    table.push(created);
    this.save();
    return created;
  }

  update(name, id, updater) {
    const table = this.table(name);
    const index = table.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return null;
    }

    const current = table[index];
    const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
    table[index] = next;
    this.save();
    return next;
  }

  delete(name, id) {
    const table = this.table(name);
    const index = table.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return false;
    }

    table.splice(index, 1);
    this.save();
    return true;
  }
}

class MySqlDatabase {
  constructor() {
    this.data = this.load();
  }

  run(command) {
    const output = execFileSync(process.execPath, [MYSQL_EXEC_PATH, JSON.stringify(command)], {
      cwd: path.join(__dirname, "../.."),
      env: {
        ...process.env,
        MYSQL_HOST: env.mysqlHost,
        MYSQL_PORT: String(env.mysqlPort),
        MYSQL_USER: env.mysqlUser,
        MYSQL_PASSWORD: env.mysqlPassword,
        MYSQL_DATABASE: env.mysqlDatabase,
        MYSQL_IMPORT_JSON: String(env.mysqlImportJson)
      },
      encoding: "utf8"
    });

    return JSON.parse(output || "null");
  }

  load() {
    const result = this.run({ type: "init" });
    return result.snapshot || clone(defaultDatabase);
  }

  table(name) {
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  all(name) {
    return this.table(name);
  }

  findById(name, id) {
    return this.table(name).find((item) => String(item.id) === String(id)) || null;
  }

  nextId(name) {
    return this.run({ type: "nextId", table: name }).nextId;
  }

  insert(name, record) {
    const created = {
      id: record.id ?? this.nextId(name),
      ...record
    };
    const stored = this.run({ type: "insert", table: name, record: created });
    this.table(name).push(stored);
    return stored;
  }

  update(name, id, updater) {
    const table = this.table(name);
    const index = table.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return null;
    }

    const current = table[index];
    const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
    const stored = this.run({ type: "update", table: name, id, record: next });
    table[index] = stored;
    return stored;
  }

  delete(name, id) {
    const table = this.table(name);
    const index = table.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return false;
    }

    const result = this.run({ type: "delete", table: name, id });
    if (result.deleted) {
      table.splice(index, 1);
      return true;
    }

    return false;
  }
}

export const jsonDb = env.dataSource === "mysql" ? new MySqlDatabase() : new FileDatabase();
export const dbPath = DB_PATH;
