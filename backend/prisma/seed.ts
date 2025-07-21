import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.form.deleteMany({});
  await prisma.client.deleteMany({});

  const now = new Date();
  const twoWeeksFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

  // Dummy clients
  const alice = await prisma.client.create({
    data: {
      name: "Alice YSQ",
      email: "alice@ysq.com",
      dob: new Date("1990-01-01"),
      status: "active",
    },
  });

  const bob = await prisma.client.create({
    data: {
      name: "Bob SMI",
      email: "bob@smi.com",
      dob: new Date("1985-05-10"),
      status: "active",
    },
  });

  const carol = await prisma.client.create({
    data: {
      name: "Carol BECKS",
      email: "carol@becks.com",
      dob: new Date("1992-03-15"),
      status: "active",
    },
  });

  const dave = await prisma.client.create({
    data: {
      name: "Dave BURNS",
      email: "dave@burns.com",
      dob: new Date("1988-08-22"),
      status: "active",
    },
  });

  // Forms for each client
  await prisma.form.create({
    data: {
      clientId: alice.id,
      form_type: "YSQ",
      token: "token-ysq",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: alice.id,
      form_type: "YSQ",
      token: "submitted-ysq",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      token_used_at: now,
      submitted_at: now,
      is_active: false,
      total_score: 210,
    },
  });

  await prisma.form.create({
    data: {
      clientId: bob.id,
      form_type: "SMI",
      token: "token-smi",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: bob.id,
      form_type: "SMI",
      token: "expired-smi",
      token_sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      token_expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      is_active: false,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: bob.id,
      form_type: "SMI",
      token: "second-smi",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: carol.id,
      form_type: "BECKS",
      token: "token-becks",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: dave.id,
      form_type: "BURNS",
      token: "token-burns",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      token_used_at: null,
      total_score: null,
    },
  });

  console.log("🌱 Seeded 4 clients and 7 forms.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
