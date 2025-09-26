import fs from "fs";
import path from "path";

export async function createFolder(machine: Record<string, any>) {

    const folderPath = path.join(__dirname, '..', 'public', machine.group);
    const backupFolderPath = path.join(__dirname, '..', 'public', machine.group, 'backup');
    const subFolderPath = path.join(__dirname, '..', 'public', machine.group, 'backup', machine.name);

    console.log(folderPath);
    console.log(backupFolderPath);
    console.log(subFolderPath);
    
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    if (!fs.existsSync(backupFolderPath)) {
        fs.mkdirSync(backupFolderPath);
    }

    if (!fs.existsSync(subFolderPath)) {
        fs.mkdirSync(subFolderPath);
    }
}