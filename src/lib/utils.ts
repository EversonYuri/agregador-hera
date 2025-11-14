export function logMessage(...args: string[]) {
  const hr = new Date();

  console.log(`[${hr.getHours()}:${hr.getMinutes()}]: ${args.join(" ")}`);
}

export async function runWithLimit(items: any[], limit: number, fn: (item: any) => Promise<any>) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.allSettled(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}