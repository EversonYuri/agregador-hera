import { openConnection } from "./db/conn";
import { logMessage } from "./lib/utils";
import { checkPort } from "./net";
import fs from "fs";

export async function gatherBasicMachineInfo(machine: Record<string, any>) {
    const timeout = setTimeout(() => {
        console.error(`⏰ Tempo esgotado ao tentar conectar no IP ${machine.ip}`);
        return machine;
    }, 30000);
    try {
        if (Array.isArray(machine.groups)) {
            let group = machine.groups.filter((group: any) => group.name !== 'All' && group.name !== 'cliente')[0];
            machine.group = group ? (group.name as string).toUpperCase() : 'ALL';
        }

        machine.isDatabase = await checkPort(machine.ip as string, 3306);

        if (machine.isDatabase) {
            const { query, release } = await openConnection(machine.ip)

            const names = (await query("SHOW DATABASES WHERE `Database` IN ('pdv', 'database')")).map((r: any) => r.Database);
            machine.isPDV = names.includes('pdv');
            machine.isServer = names.includes('database');

            if (machine.isServer) {
                const linkRow = (await query("SHOW COLUMNS FROM `database`.`configuracaobean` LIKE 'linkBachupDropbox';"))[0] ? 1 : 0;
                const dataRow = (await query("SHOW COLUMNS FROM `database`.`configuracaobean` LIKE 'dataHoraBackupNuvem';"))[0] ? 1 : 0;
                const certRow = (await query("SHOW COLUMNS FROM `database`.`configuracaobean` LIKE 'senhaCertificadoDigital';"))[0] ? 1 : 0;

                let additionalColumns = ["e.CNPJ", "e.RAZAO_SOCIAL", "c.varsaoSistema AS versaoSistema"];
                if (linkRow) additionalColumns.push("c.linkBachupDropbox");
                if (dataRow) additionalColumns.push("c.dataHoraBackupNuvem");
                if (certRow) additionalColumns.push(`JSON_OBJECT( 'senha', c.senhaCertificadoDigital, 'data_validade', c.dataValidadeCertificadoDigital, 'nome', c.nomeCertificadoDigital) AS certificadoDigital`);

                const sql = `SELECT ${additionalColumns.join(", ")} FROM \`database\`.empresabean e JOIN \`database\`.configuracaobean c;`;
                machine.serverInfo = (await query(sql))[0];

                if (machine.serverInfo && machine.serverInfo.certificadoDigital) machine.serverInfo.certificadoDigital = JSON.parse(machine.serverInfo.certificadoDigital);
                if (machine.serverInfo && machine.serverInfo.certificadoDigital && !machine.serverInfo.certificadoDigital.senha) {
                    delete machine.serverInfo.certificadoDigital;
                }
            }

            if (machine.isPDV) {
                let pdv = (await query(fs.readFileSync('src/db/query/pdvinfo.sql', 'utf-8')))[0]

                pdv.pdvInfo = JSON.parse(pdv.pdvInfo)
                pdv.notasDuplicidade = JSON.parse(pdv.notasDuplicidade)
                pdv.NCMIncorretos = JSON.parse(pdv.NCMIncorretos)
                pdv.notasRejeitadas = JSON.parse(pdv.notasRejeitadas)

                machine = { ...machine, ...pdv };
            }

            release()
        };

        logMessage(`Conectado ao database do IP ${machine.ip} e fazendo queries adicionais...`);
    } catch (error) { console.error(`Erro ao conectar na base de dados do IP ${machine.ip}:`, error); return machine }

    clearTimeout(timeout);
    return machine
}