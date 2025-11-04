// backup-remote-mariadb.js
import { spawn } from "child_process";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { logMessage } from "../lib/utils";
import path from "path";

export async function backupDatabase(host: string, dbName: string, saveLocation: string = "./public/") {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const outputFile = path.join(saveLocation, `${dbName}_${date}.sql.gz`);

  logMessage(`Backing up ${dbName} to ${outputFile}`);

  // Timeout: 60 minutes (900000 ms)
  // const TIMEOUT_MS = 900000;
  // let timeoutHandle: NodeJS.Timeout | undefined;
  // const timeoutPromise = new Promise((_, reject) => {
  //   timeoutHandle = setTimeout(() => {
  //     logMessage(`⏰ Backup on ${outputFile} timed out after 15 minutes.`);
  //     reject(`⏰ Backup on ${outputFile} timed out after 15 minutes.`);
  //   }, TIMEOUT_MS);
  // });

  const dump = Bun.spawn([
    "C:/HERA/BANCO/bin/mysqldump",
    "-h", host,
    "-u", "root",
    "-p240190",
    "--single-transaction",
    "--quick",
    "--compress",
    "--routines",
    "--events",
    "--triggers",
    dbName
  ], {
    stdio: ["ignore", "pipe", "inherit"]
  });

  // run gzip
  const gzip = Bun.spawn([
    "C:/Program Files (x86)/GnuWin32/bin/gzip.exe",
    "-c"
  ], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit"
  });

  // connect mysqldump → gzip
  // dump.stdout.pipeTo(gzip.stdin);

  // manually pipe:
  (async () => {
    const reader = dump.stdout.getReader();
    const writer = gzip.stdin as any; // FileSink
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      writer.write(value);
    }
    writer.end();
  })();


  const outFile = Bun.file(outputFile);
  // await gzip.stdout.pipeTo(outFile.writable); /

  const writer = outFile.writer();

  // Pipe gzip.stdout into a manual loop:
  for await (const chunk of gzip.stdout) {
    writer.write(chunk);
  }
  await writer.end();

  // // Race backup against timeout
  // try {
  //   await Promise.race([pipeline(gzip.stdout, out), timeoutPromise]);
  //   logMessage("✅ Backup completed:", outputFile);
  // } finally {
  //   if (timeoutHandle) clearTimeout(timeoutHandle);
  //   dump.kill("SIGTERM");
  //   gzip.kill("SIGTERM");
  //   out.close();
  //   out.destroy();
  // }
}