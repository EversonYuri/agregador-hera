import { checkPort } from "./net";

export async function gatherMachineInfo(machine: Record<string, any>): Promise<INFO> {
    let info: INFO = {}
    info.name = machine.DNSName.split('.')[0]

    if (machine.Tags && machine.Tags.length > 0) {
        info.tag = machine.Tags[0].replace('tag:', '')
    }
    info.ip = machine.TailscaleIPs[0]

    info.server = await checkPort(info.ip as string, 8080);
    info.database = await checkPort(info.ip as string, 3306);
    console.log(info);
    
    return info;
}