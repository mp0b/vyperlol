import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Veuillez spécifier l'email de l'utilisateur à promouvoir : npx tsx promote.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Utilisateur ${email} introuvable.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'OWNER' }
  });

  console.log(`✅ L'utilisateur ${email} est maintenant OWNER !`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
