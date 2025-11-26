import { logMessage } from "../lib/utils";
import path from "path";
import type { Logger } from "../log/log";

export async function backupDatabase(machine: Record<string, any>, dbName: string, saveLocation: string = Bun.env.SAVE_DIR || "", couldNotBackup: Logger) {
  const host = machine.ip
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const outputFile = path.join(saveLocation, `${dbName}_${date}.sql.gz`);

  logMessage(`Backing up ${dbName} to ${outputFile}`);

  // run mariadb-dump
  let dump = Bun.spawn([
    "C:/HERA/BANCO/bin/mysqldump",
    "-h", host,
    "-u", Bun.env.USUARIO_DB || '',
    `-p${Bun.env.SENHA_DB}`,
    "--single-transaction",
    "--quick",
    "--compress",
    "--routines",
    "--events",
    "--triggers",
    dbName
  ], {
    stdio: ["ignore", "pipe", "inherit"],
    windowsHide: true
  });

  const exitDump = await dump.exited;

  if (exitDump !== 0) {
    logMessage(`❌ mysqldump ${dbName} falhou no ${machine.name} (exit ${exitDump}). Backup cancelado.`);
    couldNotBackup.log(`❌ mysqldump ${dbName} falhou no ${machine.name} (exit ${exitDump}). Backup cancelado.`);
    couldNotBackup.createLogFile();
    return;
  }


  // run gzip
  let gzip = Bun.spawn([
    "C:/Program Files (x86)/GnuWin32/bin/gzip.exe",
    "-c"
  ], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
    windowsHide: true
  });

  // manually pipe:
  {
    const reader = dump.stdout.getReader();
    const writer = gzip.stdin as any; // FileSink
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      writer.write(value);
    }
    writer.end();
  }

  const outFile = Bun.file(outputFile);
  // await gzip.stdout.pipeTo(outFile.writable); /

  const writer = outFile.writer();

  // Pipe gzip.stdout into a manual loop:
  for await (const chunk of gzip.stdout) {
    writer.write(chunk);
  }
  await writer.end();

  logMessage(`${machine.index} - terminado o backup do ${dbName} no ${machine.name} `)
}