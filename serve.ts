import { gatherBasicMachineInfo } from "./src/machine";
import { createGroups, getComputers } from "./src/netbird";

const server = Bun.serve({
    hostname: "0.0.0.0", 
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    fetch: async (req) => {
        const url = new URL(req.url);

        switch (url.pathname) {
            case "/peerInfo":
                const ip = url.searchParams.get("ip");
                const name = url.searchParams.get("name");
                const machineInfo = await gatherBasicMachineInfo({ ip, name })
                return new Response(JSON.stringify(machineInfo));

            case "/groups": 
                const computers = await getComputers()       
                const groupSet = createGroups(computers)
                return new Response(JSON.stringify(Array.from(groupSet.values())));
            default:
                return new Response("404 Not Found", { status: 404 });
        }
    },
});

console.log(`Server running on port ${server.port}`);