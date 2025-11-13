import { logMessage } from "./lib/utils";
import { gatherBasicMachineInfo } from "./machine";

export async function getComputers() {
    const options = {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + Bun.env.NETBIRD_KEY }
    };

    console.log(Bun.env.NETBIRD_KEY);
    
    return await fetch('https://web-vpn.com.br/api/peers', options)
        .then(response => response.json())
        .catch(err => console.error(err)) as Record<string, any>[]

        
}

export async function getPeers() {
    let machines = await getComputers()

    let editedMachines: any[] = await Promise.all(machines.map(async (machine) => await gatherBasicMachineInfo(machine)));
    logMessage("✅ Terminado de pegar a informação dos peers.");

    const groupSet = createGroups(editedMachines);

    return {
        machines: editedMachines,
        groups: groupSet
    }
}

export function createGroups(editedMachines: any[]) {
    const groupSet = new Map<string, any>();
    for (const machine of editedMachines) if (machine && Array.isArray(machine.groups)) {
        for (let group of machine.groups) if (group && typeof group.name === 'string') {

            group.name = group.name.toUpperCase();

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

    return groupSet;
}