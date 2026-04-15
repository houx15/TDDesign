import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { startServer, type StartedServer } from "../../../tddesign/cli/init/server.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";

function req(
  port: number,
  method: string,
  url: string,
  body?: unknown
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request(
      {
        host: "127.0.0.1",
        port,
        method,
        path: url,
        headers: payload
          ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) }
          : {},
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      }
    );
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

describe("server", () => {
  let dir: string;
  let server: StartedServer;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-srv-"));
    server = await startServer({ targetPath: path.join(dir, "preference_vector.json") });
  });
  afterEach(async () => {
    await server.close();
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("GET /choices.json returns the CHOICES data", async () => {
    const r = await req(server.port, "GET", "/choices.json");
    expect(r.status).toBe(200);
    const parsed = JSON.parse(r.body);
    expect(parsed.dimensions.map((d: any) => d.dimension)).toEqual(
      CHOICES.map((d) => d.dimension)
    );
  });

  it("GET / returns HTML containing every dimension question", async () => {
    const r = await req(server.port, "GET", "/");
    expect(r.status).toBe(200);
    for (const d of CHOICES) {
      expect(r.body).toContain(d.question);
    }
  });

  it("POST /submit with valid payload writes file and returns 200", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    const r = await req(server.port, "POST", "/submit", { mood: "minimal", picks });
    expect(r.status).toBe(200);
    const written = await fs.readFile(
      path.join(dir, "preference_vector.json"),
      "utf8"
    );
    expect(JSON.parse(written).profile_name).toBe("local");
  });

  it("POST /submit with unknown option id returns 400 and does not write", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    picks.color_direction = "not-a-thing";
    const r = await req(server.port, "POST", "/submit", { mood: "minimal", picks });
    expect(r.status).toBe(400);
    await expect(
      fs.access(path.join(dir, "preference_vector.json"))
    ).rejects.toThrow();
  });

  it("POST /submit with malformed JSON returns 400", async () => {
    const r = await new Promise<{ status: number }>((resolve, reject) => {
      const rq = http.request(
        {
          host: "127.0.0.1",
          port: server.port,
          method: "POST",
          path: "/submit",
          headers: { "content-type": "application/json" },
        },
        (res) => {
          res.on("data", () => {});
          res.on("end", () => resolve({ status: res.statusCode ?? 0 }));
        }
      );
      rq.on("error", reject);
      rq.write("{not json");
      rq.end();
    });
    expect(r.status).toBe(400);
  });
});
