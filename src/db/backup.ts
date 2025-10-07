import { exec } from 'child_process';
import path from 'path';

export async function backupDb(machine: Record<string, any>, databaseName: string) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const folderPath = path.join(__dirname, '../..', 'public', 'ESTABELECIMENTOS', machine.group || 'ALL', 'backup', machine.name, `backup_${databaseName.replaceAll(' ', '-')}_${machine.name.replaceAll(' ', '-')}_${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}`);
    const mariadbDumpPath = 'C:\\HERA\\BANCO\\bin\\mariadb-dump.exe';

    const backupCommand = `${mariadbDumpPath} -h ${machine.ip} -u root -p240190 ${databaseName} > "${folderPath}.sql"`;
    const compressCommand = `powershell Compress-Archive -Force -LiteralPath '${folderPath}.sql' -DestinationPath '${folderPath}.zip'`;
    const deleteCommand = `del "${folderPath}.sql"`;

    exec(`${backupCommand} && ${compressCommand} && ${deleteCommand}`, (error, stdout, stderr) => {
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