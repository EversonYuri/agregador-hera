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

    const groupSet = new Set<string>();
    for (const machine of editedMachines) {
        if (machine && Array.isArray(machine.groups)) {
            for (const group of machine.groups) {
                if (group && typeof group.name === 'string') {
                    groupSet.add(group.name);
                }
            }
        }
    }

    return {
        machines: editedMachines,
        groups: Array.from(groupSet)
    }
}