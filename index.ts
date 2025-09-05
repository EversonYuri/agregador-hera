import { execSync } from 'child_process';
import { createHTMLFile } from './src/machine';



const tailscale_machines = execSync('tailscale status -json', { encoding: 'utf8' });

const machines = JSON.parse(tailscale_machines);

try {
    createHTMLFile(machines);
} catch (error) { console.error('Erro ao analisar JSON:', error) }