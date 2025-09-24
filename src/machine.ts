import { openConnection } from "./db/conn";
import { checkPort } from "./net";


export async function gatherBasicMachineInfo(machine: Record<string, any>) {
    if (Array.isArray(machine.groups)) {
        let group = machine.groups.filter((group: any) => group.name !== 'All' && group.name !== 'cliente')[0];
        machine.group = group ? group.name : 'ALL';
    }

    machine.isServer = await checkPort(machine.ip as string, 8080);
    machine.isDatabase = await checkPort(machine.ip as string, 3306);
    if (machine.isDatabase) {
        machine.isPDV = await openConnection(machine.ip)
            .then(conn => conn.query("SHOW DATABASES LIKE 'pdv'"))
            .then(rows => rows.length > 0);
    } else machine.isPDV = false;

    return machine
}