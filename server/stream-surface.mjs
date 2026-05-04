/**
 * Minimal SSE demo: two JSON payloads your client could feed to MessageProcessor.processMessages incrementally.
 * Run: npm run dev:stream   (default http://127.0.0.1:3891)
 *
 * Browser: new EventSource('http://127.0.0.1:3891/stream') — handle message events; JSON.parse(e.data).
 */
import http from "node:http";

const port = Number(process.env.STREAM_DEMO_PORT || 3891);
const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const chunks = [
  {
    version: "v0.9",
    createSurface: { surfaceId: "stream-demo", catalogId: CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "stream-demo",
      components: [
        {
          id: "root",
          component: "Column",
          children: ["t"],
          justify: "start",
          align: "stretch",
        },
        { id: "t", component: "Text", text: "Chunk 2 streamed after createSurface", variant: "body" },
      ],
    },
  },
];

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
  if (req.method === "GET" && req.url === "/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    });
    let i = 0;
    const tick = () => {
      if (i >= chunks.length) {
        res.write("event: done\ndata: {}\n\n");
        res.end();
        return;
      }
      res.write(`event: a2ui\ndata: ${JSON.stringify(chunks[i])}\n\n`);
      i++;
      setTimeout(tick, 400);
    };
    tick();
    return;
  }
  res.writeHead(404);
  res.end("GET /stream or /healthz");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[stream-surface] SSE http://127.0.0.1:${port}/stream`);
});
