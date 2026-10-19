import prisma from "@/lib/prisma";

// GET /api/db-check - Health check: verifies connectivity and that the schema is migrated.
export async function GET() {
  try {
    // Query the table (not just SELECT 1) so a missing migration is reported.
    await prisma.$queryRaw`SELECT 1 FROM psir_reports LIMIT 1`;

    return Response.json({ ok: true, database: "PostgreSQL", prisma: "connected" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
