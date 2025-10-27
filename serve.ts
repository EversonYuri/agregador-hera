import { gatherBasicMachineInfo } from "./src/machine";

const server = Bun.serve({
    port: 3000,
    fetch: async (req) => {
        const url = new URL(req.url);

        switch (url.pathname) {
            case "/peerInfo":
                const ip = url.searchParams.get("ip");
                const machineInfo = await gatherBasicMachineInfo({ ip })
                return new Response(JSON.stringify(machineInfo));
            default:
                return new Response("404 Not Found", { status: 404 });
        }
    },
});

console.log("Server running on http://localhost:3000");