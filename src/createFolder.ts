import fs from "fs";
import path from "path";

export function createFolder(folderName: string) {
    const folderPath = path.join(Bun.env.SAVE_DIR || "", folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        console.log(`Pasta '${folderName}' criada com sucesso em ${folderPath}`);
    }
}

export function createStoreFolder(machine: Record<string, any>) {
    createFolder('ESTABELECIMENTOS')
    createFolder(path.join('ESTABELECIMENTOS', machine.group || "SEM GRUPO"))
    createFolder(path.join('ESTABELECIMENTOS', machine.group || "SEM GRUPO", 'backup'))
    createFolder(path.join('ESTABELECIMENTOS', machine.group || "SEM GRUPO", 'backup', machine.name))
}