// Provisions a support-agent account. Agent accounts are never created
// through the public /register endpoint (which always assigns "customer"),
// so this script is the supported way to grant agent access.
//
// Usage: npm run create-agent -- <email> <password>
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npm run create-agent -- <email> <password>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: { role: "agent", passwordHash },
      create: { email: email.trim().toLowerCase(), passwordHash, role: "agent" },
    });
    console.log(`Agent account ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to create agent account:", error);
  process.exit(1);
});
