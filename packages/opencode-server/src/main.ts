import { initialize as initGlobal } from "../../opencode/src/global/index"
import { Server } from "../../opencode/src/server/server"
import { Flag } from "../../opencode/src/flag/flag"
import { Log } from "../../opencode/src/util/log"

// ── OpenTelemetry → Langfuse ──
// Registers a TracerProvider BEFORE any AI SDK call so that
// experimental_telemetry spans are actually exported.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const { NodeSDK } = await import("@opentelemetry/sdk-node")
  const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http")
  const { Resource } = await import("@opentelemetry/resources")
  const sdk = new NodeSDK({
    resource: new Resource({
      "service.name": process.env.OTEL_SERVICE_NAME || "opencode",
    }),
    traceExporter: new OTLPTraceExporter(),
  })
  sdk.start()
}

declare const OPENCODE_VERSION: string

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(OPENCODE_VERSION)
  process.exit(0)
}

await initGlobal()
await Log.init({
  print: process.argv.includes("--print-logs"),
  dev: false,
  level: (() => {
    const idx = process.argv.indexOf("--log-level")
    if (idx !== -1) return process.argv[idx + 1] as Log.Level
    return "INFO"
  })(),
})

const hostname = (() => {
  const idx = process.argv.indexOf("--hostname")
  return idx !== -1 ? process.argv[idx + 1] : "127.0.0.1"
})()

const port = (() => {
  const idx = process.argv.indexOf("--port")
  return idx !== -1 ? Number(process.argv[idx + 1]) : 4096
})()

if (!Flag.OPENCODE_SERVER_PASSWORD) {
  console.log("Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.")
}

const server = Server.listen({ hostname, port })
console.log(`opencode server listening on http://${server.hostname}:${server.port}`)

await new Promise(() => {})
