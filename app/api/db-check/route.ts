import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Verify the psir_reports table actually exists (not just connectivity).
    // This ensures waitForServer() in electron/main.js only resolves after
    // migrations have completed and the schema is ready to serve real requests.
    await prisma.$queryRaw`SELECT 1 FROM psir_reports LIMIT 1`;

    return Response.json({ ok: true, database: "SQLite", prisma: "connected" });
  } catch (e: any) {
    // Return 503 so Electron's waitForServer() keeps polling instead of
    // treating a table-not-found error as a successful startup.
    return Response.json({ ok: false, error: e.message }, { status: 503 });
  }
}
