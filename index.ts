import { execSync } from 'child_process';
import { checkPort } from './src/net';
import { writeFileSync } from 'fs';

interface INFO {
    name?: string | undefined;
    tag?: string | undefined;
    ip?: string | undefined;
    server?: boolean | undefined;
}

const tailscale_machines = execSync('tailscale status -json', { encoding: 'utf8' });

const machines = JSON.parse(tailscale_machines);

async function gatherMachineInfo(id: string): Promise<INFO> {
    const machine = machines.Peer[id];
    let info: INFO = {}
    info.name = machine.DNSName.split('.')[0]

    if (machine.Tags && machine.Tags.length > 0) {
        info.tag = machine.Tags[0].replace('tag:', '')
    }
    info.ip = machine.TailscaleIPs[0]

    info.server = await checkPort(info.ip as string, 8080);
    return info;
}

try {
    const machineIds = Object.keys(machines.Peer)    
    machineIds.map(async id => {
        const info = await gatherMachineInfo(id);
        if (info.server && info.ip) {
            const fileName = `public/${info.tag || info.ip}.html`;
            const redirectHtml = `
<!DOCTYPE html>
<html lang=\"pt-BR\">
<head>
<meta charset=\"UTF-8\">
<title>Redirecionando para Gestão Fácil</title>
<meta http-equiv=\"refresh\" content=\"0; url=http://${info.ip}:8080/gestaofacil\" />
</head>
<body>
<p>Redirecionando para <a href=\"http://${info.ip}:8080/gestaofacil\">Gestão Fácil</a>...</p>
</body>
</html>`;
            writeFileSync(fileName, redirectHtml, { encoding: 'utf8' });
        }
    });
} catch (error) { console.error('Erro ao analisar JSON:', error) }