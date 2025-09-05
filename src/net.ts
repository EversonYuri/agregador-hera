import * as net from 'net';

export function checkPort(ip: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('error', () => {
            resolve(false);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, ip);
    });
}