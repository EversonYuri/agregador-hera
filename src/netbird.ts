import { gatherBasicMachineInfo } from "./machine";

export async function getPeers() {
    const options = {
        method: 'GET',
        headers: { Authorization: 'Bearer nbp_Q3fiAvIBkB4uxFqyfp04rkXDDe8hfz2zhPs4' }
    };


    let machines = await fetch('https://wweb-api.duckdns.org/api/peers', options)
        .then(response => response.json())
        .catch(err => console.error(err)) as Record<string, any>[]

    let editedMachines: any[] = await Promise.all(machines.map(async (machine) => await gatherBasicMachineInfo(machine)));

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
                            isServer: machine.isServer,
                        }
                    ]
                })
            }

        }
    }
    console.log(groupSet);


    return {
        machines: editedMachines,
        groups: groupSet
    }
}