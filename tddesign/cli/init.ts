import path from "node:path";
import { startServer } from "./init/server.js";
import { openBrowser } from "./init/open.js";

async function main(): Promise<void> {
  const target = path.resolve(process.cwd(), "preference_vector.json");
  const server = await startServer({ targetPath: target });
  process.stdout.write(`taste init running at ${server.url}\n`);
  openBrowser(server.url);

  const timeoutMs = 15 * 60 * 1000;
  const timeout = setTimeout(() => {
    process.stderr.write("timed out waiting for submission\n");
    server.close().finally(() => process.exit(1));
  }, timeoutMs);

  await server.submitted;
  clearTimeout(timeout);
  process.stdout.write(`\u2713 wrote ${target}\n`);
  // Server shuts itself down after /shutdown is posted by the success screen.
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
