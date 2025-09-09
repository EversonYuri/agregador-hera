import fs from "fs";
import path from "path";

export async function createFolder(machine: Record<string, any>) {

    const folderPath = path.join(__dirname, 'public', (machine.info.tag || machine.info.name) as string);
    console.log(folderPath);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}