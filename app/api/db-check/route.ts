import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Check Prisma connection by executing a simple query
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({ ok: true, database: "SQLite", prisma: "connected" });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
