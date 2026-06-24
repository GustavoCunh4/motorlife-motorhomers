import crypto from "node:crypto";
import { argv, exit } from "node:process";

const password = argv[2];

if (!password) {
  console.error("Uso: node scripts/hash-admin-password.mjs \"sua-senha\"");
  exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 32).toString("hex");
const sessionSecret = crypto.randomBytes(32).toString("hex");

console.log(`ADMIN_PASSWORD_SALT=${salt}`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
