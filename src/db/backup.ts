import { logMessage } from "../lib/utils";
import path from "path";

export async function backupDatabase(host: string, dbName: string, saveLocation: string = Bun.env.SAVE_DIR || "") {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const outputFile = path.join(saveLocation, `${dbName}_${date}.sql.gz`);

  // logMessage(`Backing up ${dbName} to ${outputFile}`);
  console.log("docker", "exec", "-i", "mariadb",  
    "mariadb-dump",
    "-h", host,
    "-u", Bun.env.USUARIO_DB || '',
    `-p${Bun.env.SENHA_DB}`,
    "--skip-ssl",
    "--single-transaction",
    "--quick",
    "--compress",
    "--routines",
    "--events",
    "--triggers",
    dbName)

  // run mariadb-dump
  let dump
  if (process.platform === "win32") {
    dump = Bun.spawn([
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
      stdio: ["ignore", "pipe", "inherit"]
    });
  } else {
    dump = Bun.spawn([
      "docker", "exec", "-i", "mariadb",  // nome do container
      "mariadb-dump",
      "-h", host,
      "-u", Bun.env.USUARIO_DB || '',
      `-p${Bun.env.SENHA_DB}`,
      "--skip-ssl",
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
  }


  // run gzip
  let gzip
  if (process.platform === "win32") {
    gzip = Bun.spawn([
      "C:/Program Files (x86)/GnuWin32/bin/gzip.exe",
      "-c"
    ], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "inherit"
    });
  } else {
    gzip = Bun.spawn(["gzip", "-c"], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "inherit",
    });
  }

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

  logMessage(`terminado o backup ${dbName}`)
}