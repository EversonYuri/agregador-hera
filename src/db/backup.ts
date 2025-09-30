import { exec } from 'child_process';
import path from 'path';

export async function backupDb(machine: Record<string, any>, databaseName: string) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const folderPath = path.join(__dirname, '../..', 'public', 'ESTABELECIMENTOS', machine.group || 'ALL', 'backup', machine.name, `backup_${databaseName}_${machine.name}_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}.sql`);

    exec(`C:\\HERA\\BANCO\\bin\\mariadb-dump.exe -h ${machine.ip} -u root -p240190 ${databaseName} > "${folderPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error backing up database: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error backing up database: ${stderr}`);
            return;
        }
        console.log(`${databaseName} backup successful on ${machine.group} ${stdout}`);
    });
}