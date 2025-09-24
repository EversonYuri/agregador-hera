import fs from "fs";
import path from "path";

export async function createFolder(machine: string) {

    const folderPath = path.join(__dirname, '..', 'public', machine);

    console.log(folderPath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}