// backup-remote-mariadb.js
import { spawn } from "child_process";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";

function logMessage(...args: string[]) {
  const hr = new Date();

  console.log(`[${hr.getHours()}:${hr.getMinutes()}]: ${args.join(" ")}`);
}

export async function backupDatabase(host: string, dbName: string, saveLocation: string = "./public/") {
  logMessage("Starting remote backup...");

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const outputFile = path.join(saveLocation, `${dbName}_${date}.sql.gz`);

  logMessage(`Backing up ${dbName} to ${outputFile}`);

  // Timeout: 60 minutes (3600000 ms)
  const TIMEOUT_MS = 3600000;
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      logMessage(`⏰ Backup on ${outputFile} timed out after 60 minutes.`);
      reject(`⏰ Backup on ${outputFile} timed out after 60 minutes.`);
    }, TIMEOUT_MS);
  });

  // mysqldump command (no locking, safe for VPN)
  const dump = spawn("C:/HERA/BANCO/bin/mysqldump", [
    "-h", host,
    "-u", "root",
    `-p240190`,
    "--single-transaction",
    "--quick",
    "--compress",
    "--routines",
    "--events",
    "--triggers",
    dbName
  ], { stdio: ["ignore", "pipe", "inherit"] });

  // gzip compression
  const gzip = spawn("C:/Program Files (x86)/GnuWin32/bin/gzip.exe", ["-c"], { stdio: ["pipe", "pipe", "inherit"] });

  // Pipe mysqldump → gzip → file
  dump.stdout.pipe(gzip.stdin);

  const out = createWriteStream(outputFile);

  // Race backup against timeout
  await Promise.race([
    pipeline(gzip.stdout, out),
    timeoutPromise
  ]);
  if (timeoutHandle) clearTimeout(timeoutHandle);

  logMessage("✅ Backup completed:", outputFile);
}