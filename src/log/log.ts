import path from "path";
import { createFolder } from "../createFolder";
import fs from "fs";

export class Logger {
    name: string;
    private __log: string = ''

    constructor(name: string) {
        this.name = name;
        createFolder(path.join(Bun.env.SAVE_DIR || "", 'logs'));
        createFolder(path.join(Bun.env.SAVE_DIR || "", 'logs', name));
    }

    log(message: string) {
        this.__log += `${message}\n`;
    }

    getLog() {
        return this.__log;
    }

    createLogFile() {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
        const filePath = path.join(__dirname, '../..', 'public', 'logs', this.name, `${this.name}_${dateStr}.log`);
        console.log(filePath)
        fs.writeFileSync(filePath, this.__log);
    }
}