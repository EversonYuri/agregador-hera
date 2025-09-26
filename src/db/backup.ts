import { exec } from 'child_process';
import path from 'path';

export async function backupDb(machine: Record<string, any>, databaseName: string) {
    const folderPath = path.join(__dirname, '../..', 'public', machine.group || 'ALL', 'backup', machine.name, `backup_${databaseName}_${machine.name}.sql`);

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