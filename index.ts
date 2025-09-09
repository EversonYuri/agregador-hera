import { execSync } from 'child_process';
import { gatherMachineInfo } from './src/machine';
import { createFolder } from './src/createFolder';
import { createHTMLFile } from './src/createHTMLFile';

const tailscale_machines = execSync('tailscale status -json', { encoding: 'utf8' });

const machines = JSON.parse(tailscale_machines);

try {
    const machineIds = Object.keys(machines.Peer)

    machineIds.map(async id => {
        let machine = machines.Peer[id]
        machine.info = await gatherMachineInfo(machine);

        if (machine.Online && machine.OS === "windows" && machine.info.server) {
            await createFolder(machine)
            createHTMLFile(machine)
        }
    })

} catch (error) { console.error('Erro ao analisar JSON:', error) }