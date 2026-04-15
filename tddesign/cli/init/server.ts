import http from "node:http";
import { AddressInfo } from "node:net";
import { CHOICES } from "./choices.js";
import { assembleVector, writeVector, type SubmitPayload } from "./writer.js";
import { buildIndexHtml } from "./render.js";

export interface StartOptions {
  targetPath: string;
  port?: number;
}

export interface StartedServer {
  port: number;
  url: string;
  close: () => Promise<void>;
  submitted: Promise<void>;
}

export async function startServer(opts: StartOptions): Promise<StartedServer> {
  let resolveSubmitted: () => void;
  const submitted = new Promise<void>((r) => (resolveSubmitted = r));

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/choices.json") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ dimensions: CHOICES }));
        return;
      }
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(buildIndexHtml());
        return;
      }
      if (req.method === "POST" && req.url === "/submit") {
        const body = await readJson(req);
        const payload = body as SubmitPayload;
        const vector = assembleVector(payload);
        await writeVector(opts.targetPath, vector);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, path: opts.targetPath }));
        resolveSubmitted();
        return;
      }
      if (req.method === "POST" && req.url === "/shutdown") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        setTimeout(() => server.close(), 10);
        return;
      }
      res.writeHead(404);
      res.end("not found");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: message }));
    }
  });

  await new Promise<void>((resolve) =>
    server.listen(opts.port ?? 0, "127.0.0.1", () => resolve())
  );
  const port = (server.address() as AddressInfo).port;

  return {
    port,
    url: `http://127.0.0.1:${port}/`,
    submitted,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      ),
  };
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("invalid JSON body");
  }
}
