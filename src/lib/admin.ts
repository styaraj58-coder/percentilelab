import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// For admin-only route handlers. The role is read from the database (not just
// the login token) so a demotion takes effect at once.
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}
