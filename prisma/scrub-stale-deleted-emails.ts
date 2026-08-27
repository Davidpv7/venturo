import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// One-off: commit 8eead4a made deleteAccount() scrub email on soft-delete so
// the address can be reused for a new signup. That fix isn't retroactive —
// accounts soft-deleted before it still hold their original email, which
// collides with a real re-signup today (see signup/actions.ts and
// require-user.ts's self-heal). Run once per environment:
//   npx tsx prisma/scrub-stale-deleted-emails.ts

const PLACEHOLDER_PATTERN = /^deleted-.+@deleted\.venturocoliving\.invalid$/;

async function main() {
  const candidates = await prisma.user.findMany({ where: { deletedAt: { not: null } } });
  const stale = candidates.filter((u) => !PLACEHOLDER_PATTERN.test(u.email));

  for (const user of stale) {
    const newEmail = `deleted-${user.id}@deleted.venturocoliving.invalid`;
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    console.log(`Scrubbed ${user.email} -> ${newEmail}`);
  }

  console.log(`Scrubbed ${stale.length} of ${candidates.length} soft-deleted user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
