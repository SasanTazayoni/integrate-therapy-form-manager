import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.form.deleteMany({});
  await prisma.client.deleteMany({});

  const now = new Date();
  const twoWeeksFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

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

  const emma = await prisma.client.create({
    data: {
      name: "Emma MultiForm",
      email: "emma@multi.com",
      dob: new Date("1993-07-10"),
      status: "active",
    },
  });

  const frank = await prisma.client.create({
    data: {
      name: "Frank Expired",
      email: "frank@expired.com",
      dob: new Date("1980-02-20"),
      status: "active",
    },
  });

  await prisma.form.create({
    data: {
      clientId: alice.id,
      form_type: "YSQ",
      token: "submitted-ysq",
      token_sent_at: now,
      token_expires_at: now,
      submitted_at: now,
      is_active: false,
      revoked_at: null,
      bdi_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: bob.id,
      form_type: "SMI",
      token: "submitted-smi",
      token_sent_at: now,
      token_expires_at: now,
      submitted_at: now,
      is_active: false,
      revoked_at: null,
      bdi_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: carol.id,
      form_type: "BECKS",
      token: "token-becks-active",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      revoked_at: null,
      bdi_score: null,
    },
  });

  await prisma.form.create({
    data: {
      clientId: dave.id,
      form_type: "BURNS",
      token: "token-burns-active",
      token_sent_at: now,
      token_expires_at: twoWeeksFromNow,
      is_active: true,
      submitted_at: null,
      revoked_at: null,
      bdi_score: null,
    },
  });

  await prisma.form.createMany({
    data: [
      {
        clientId: emma.id,
        form_type: "YSQ",
        token: "emma-ysq-submitted",
        token_sent_at: now,
        token_expires_at: now,
        submitted_at: now,
        is_active: false,
        revoked_at: null,
        bdi_score: null,
      },
      {
        clientId: emma.id,
        form_type: "SMI",
        token: "emma-smi-active",
        token_sent_at: now,
        token_expires_at: twoWeeksFromNow,
        submitted_at: null,
        is_active: true,
        revoked_at: null,
        bdi_score: null,
      },
      {
        clientId: emma.id,
        form_type: "BURNS",
        token: "emma-burns-active",
        token_sent_at: now,
        token_expires_at: twoWeeksFromNow,
        submitted_at: null,
        is_active: true,
        revoked_at: null,
        bdi_score: null,
      },
      {
        clientId: emma.id,
        form_type: "BECKS",
        token: "emma-becks-submitted",
        token_sent_at: now,
        token_expires_at: now,
        submitted_at: now,
        is_active: false,
        revoked_at: null,
        bdi_score: "19-Moderate depression",
      },
    ],
  });

  await prisma.form.createMany({
    data: [
      {
        clientId: frank.id,
        form_type: "BECKS",
        token: "frank-expired-becks",
        token_sent_at: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        token_expires_at: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        submitted_at: null,
        is_active: false,
        revoked_at: null,
        bdi_score: null,
      },
      {
        clientId: frank.id,
        form_type: "SMI",
        token: "frank-expired-smi",
        token_sent_at: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        token_expires_at: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        submitted_at: null,
        is_active: false,
        revoked_at: null,
        bdi_score: null,
      },
      {
        clientId: frank.id,
        form_type: "YSQ",
        token: "frank-revoked-ysq",
        token_sent_at: now,
        token_expires_at: now,
        submitted_at: null,
        is_active: false,
        revoked_at: now,
        bdi_score: null,
      },
    ],
  });

  console.log("🌱 Seeded clients and forms.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
