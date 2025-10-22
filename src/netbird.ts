import { logMessage } from "./lib/utils";
import { gatherBasicMachineInfo } from "./machine";

export async function getPeers() {
    const options = {
        method: 'GET',
        headers: { Authorization: 'Bearer nbp_PXReq0Q4pPpvIg7yFTVgwUkDLuj6eU2N6T1A' }
    };


    let machines = await fetch('https://web-vpn.com.br/api/peers', options)
        .then(response => response.json())
        .catch(err => console.error(err)) as Record<string, any>[]

    let editedMachines: any[] = await Promise.all(machines.map(async (machine) => await gatherBasicMachineInfo(machine)));
    logMessage("✅ Terminado de pegar a informação dos peers.");

    const groupSet = new Map<string, any>();
    for (const machine of editedMachines) if (machine && Array.isArray(machine.groups)) {
        for (const group of machine.groups) if (group && typeof group.name === 'string') {

            if (groupSet.has(group.name)) {
                let currentGroup = groupSet.get(group.name);
                currentGroup.computadores.push({
                    ip: machine.ip,
                    name: machine.name,
                    isServer: machine.isServer,
                })
                groupSet.set(currentGroup.name, currentGroup)
            } else {
                let currentGroup = { name: group.name }
                groupSet.set(currentGroup.name, {
                    ...group, computadores: [
                        {
                            ip: machine.ip,
                            name: machine.name,
                            isServer: machine.isServer
                        }
                    ]
                })
            }
        }
    }

    return {
        machines: editedMachines,
        groups: groupSet
    }
}