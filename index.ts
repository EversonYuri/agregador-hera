import { createFolder } from './src/createFolder';
import { createHTMLFile } from './src/createHTMLFile';
import { backupDb } from './src/db/backup';
import { getPeers } from './src/netbird';


async function main() {

    const { machines, groups } = await getPeers()

    // Criação das pastas
    //
    //
    try {
        for (const machine of machines) await createFolder(machine)
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
        for (const machine of machines) {
            if (machine.isServer) backupDb(machine, 'database');
        }
    } catch (error) { console.error('Erro ao fazer backup do banco do database:', error) }

    // Backup do pdv
    //
    //
    try {
        for (const machine of machines) {
            if (machine.isPDV) backupDb(machine, 'pdv');
        }
    } catch (error) { console.error('Erro ao fazer backup do banco do pdv:', error) }

    // Log das informações coletadas
    //
    //
    try {
        for (const machine of machines) {
            const log = `
IP: ${machine.ip}
NOME: ${machine.name}
GRUPO: ${machine.group}
PDV INFO:
    TIPO APLICATIVO: ${machine.pdvInfo ? machine.pdvInfo[0]?.TIPO_APLICATIVO : 'N/A'}
    EMISSOR: ${machine.pdvInfo ? machine.pdvInfo[0]?.SERVIDOR_NFCE : 'N/A'}
    NOME CAIXA: ${machine.pdvInfo ? machine.pdvInfo[0]?.NOME : 'N/A'}
    VERSAO PDV: ${machine.pdvInfo ? machine.pdvInfo[0]?.versao : 'N/A'}
    NOTAS REJEITADAS: ${machine.notasRejeitadas ? machine.notasRejeitadas.length : 'N/A'}
        NCM INCORRETOS: ${machine.NCMIncorretos ? JSON.stringify(machine.NCMIncorretos, null, 2) : 'N/A'}
    NOTAS DUPLICIDADE: ${machine.notasDuplicidade ? machine.notasDuplicidade.length : 'N/A'}
SERVER INFO:
    RAZAO SOCIAL: ${machine.serverInfo ? machine.serverInfo[0]?.RAZAO_SOCIAL : 'N/A'}
    CNPJ: ${machine.serverInfo ? machine.serverInfo[0]?.CNPJ : 'N/A'}
    VERSAO SERVER: ${machine.serverInfo ? machine.serverInfo[0]?.versaoSistema : 'N/A'}`
            console.log(log);
        }
    } catch (error) { console.error('Erro ao fazer o log do computador:', error) }
}

main()