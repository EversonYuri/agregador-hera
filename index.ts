import { createStoreFolder } from './src/createFolder';
import { createHTMLFile } from './src/createHTMLFile';
import { backupDatabase } from './src/db/backup';
import { Logger } from './src/log/log';
import { getPeers } from './src/netbird';


async function main() {
    const info = new Logger('info');
    const notasRejeitadas = new Logger('notasRejeitadas');
    const couldNotBackup = new Logger('notasRejeitadas');

    const { machines, groups } = await getPeers()

    // Criação das pastas
    //
    //
    try {
        for (const machine of machines) createStoreFolder(machine)
    } catch (error) { console.error('Erro a criar a pasta:', error) }

    // Criação dos arquivos HTML
    //
    //
    try {
        for (const machine of machines) createHTMLFile(machine)
    } catch (error) { console.error('Erro ao coletar informações do computador:', error) }

    // Backup do database
    //
    //
    try {
        for (const machine of machines)
            if (machine.isServer && machine.connected) {
                machine.index = machines.indexOf(machine) + 1;
                backupDatabase(machine, 'database', `${Bun.env.SAVE_DIR}/ESTABELECIMENTOS/${machine.group}/backup/${machine.name}/`, couldNotBackup);
            }
    } catch (error) { console.error('Erro ao fazer backup do banco do database:', error) }

    // Backup do pdv
    //
    //
    try {
        for (const machine of machines)
            if (machine.isPDV && machine.connected) {
                machine.index = machines.indexOf(machine) + 1;
                backupDatabase(machine, 'pdv', `${Bun.env.SAVE_DIR}/ESTABELECIMENTOS/${machine.group}/backup/${machine.name}/`, couldNotBackup);
            }
    } catch (error) { console.error('Erro ao fazer backup do banco do pdv:', error) }

    // Log das informações coletadas
    // 
    // 
    try {
        for (const machine of machines) info.log(`IP: ${machine.ip}\nNOME: ${machine.name}\nGRUPO: ${machine.group}\nPDV INFO:\nTIPO APLICATIVO: ${machine.pdvInfo ? machine.pdvInfo[0]?.TIPO_APLICATIVO : 'N/A'}\nEMISSOR: ${machine.pdvInfo ? machine.pdvInfo[0]?.SERVIDOR_NFCE : 'N/A'}\nNOME CAIXA: ${machine.pdvInfo ? machine.pdvInfo[0]?.NOME : 'N/A'}\nVERSAO PDV: ${machine.pdvInfo ? machine.pdvInfo[0]?.versao : 'N/A'}\nNOTAS DUPLICIDADE: ${machine.notasDuplicidade ? machine.notasDuplicidade.length : 'N/A'}\nNOTAS REJEITADAS: ${machine.notasRejeitadas ? machine.notasRejeitadas.length : 'N/A'}\nNCM INCORRETOS: ${machine.NCMIncorretos ? JSON.stringify(machine.NCMIncorretos) : 'N/A'}\nSERVER INFO:\nRAZAO SOCIAL: ${machine.serverInfo ? machine.serverInfo[0]?.RAZAO_SOCIAL : 'N/A'}\nCNPJ: ${machine.serverInfo ? machine.serverInfo[0]?.CNPJ : 'N/A'}\nVERSAO SERVER: ${machine.serverInfo ? machine.serverInfo[0]?.versaoSistema : 'N/A'}\n`)
        info.createLogFile();
    } catch (error) { console.error('Erro ao fazer o log do computador:', error) }

    // Log das notas rejeitadas
    // 
    // 
    try {
        for (const machine of machines) if (machine.notasRejeitadas && machine.notasRejeitadas.length > 0 || machine.notasDuplicidade && machine.notasRejeitadas.length > 0) {
            let grupos = `GRUPO: ${machine.group}\n`
            for (const computador of groups.get(machine.group).computadores) {
                if (computador.isServer) grupos += `   ${computador.name}: http://${computador.ip}:8080/gestaofacil\n`
            }

            let NCMIncorretos = ''
            if (machine.NCMIncorretos && machine.NCMIncorretos.length > 0) {
                NCMIncorretos += 'NCMS INCORRETOS:\n'
                for (const nota of machine.NCMIncorretos)
                    NCMIncorretos += `   ${nota.GTIN} ${nota.DESCRICAO}\n`
            }
            if (machine.pdvInfo && machine.pdvInfo.length > 0 && machine.pdvInfo[0].TIPO_APLICATIVO) notasRejeitadas.log(`\nIP: ${machine.ip}\nNOME: ${machine.name}\n${grupos}NOTAS REJEITADAS: ${machine.notasRejeitadas ? machine.notasRejeitadas.length : 'N/A'}\nNOTAS DUPLICIDADE: ${machine.notasDuplicidade ? machine.notasDuplicidade.length : 'N/A'}\n${NCMIncorretos}`);
        }
        notasRejeitadas.createLogFile();
    } catch (error) { console.error('Erro ao fazer o log das notas rejeitadas:', error) }

    console.log('Processo finalizado!');
}

main()

