import { createFolder } from './src/createFolder';
import { createHTMLFile } from './src/createHTMLFile';
import { getPeers } from './src/netbird';


async function main() {

    const { machines, groups } = await getPeers()

    try {
        for (const group of groups) await createFolder(group)
    } catch (error) { console.error('Erro a criar a pasta:', error) }

    try {
        for (const machine of machines) createHTMLFile(machine)        
    } catch (error) { console.error('Erro ao coletar informações do computador:', error)}
}

main()