import { PrismaClient } from "@prisma/client";
import { generateScore } from "../utils/SMIScoreUtilsBackend";
import { smiBoundaries, labels } from "../utils/SMIBoundariesBackend";

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

  // Alice YSQ
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
      bai_score: null,
      ysq_ed_score: "32-very-high",
      ysq_ab_score: "34-high",
      ysq_ma_score: "26-high",
      ysq_si_score: "20-medium",
      ysq_ds_score: "35-very-high",
      ysq_fa_score: "14-medium",
      ysq_di_score: "18-medium",
      ysq_vu_score: "28-high",
      ysq_eu_score: "16-medium",
      ysq_sb_score: "27-high",
      ysq_ss_score: "36-very-high",
      ysq_ei_score: "15-medium",
      ysq_us_score: "40-very-high",
      ysq_et_score: "18-medium",
      ysq_is_score: "21-high",
      ysq_as_score: "33-high",
      ysq_np_score: "27-high",
      ysq_pu_score: "38-high",
      ysq_ed_456: "24-high",
      ysq_ab_456: "29-high",
      ysq_ma_456: "20-medium",
      ysq_si_456: "18-medium",
      ysq_ds_456: "30-high",
      ysq_fa_456: "10-low",
      ysq_di_456: "14-medium",
      ysq_vu_456: "20-medium",
      ysq_eu_456: "13-medium",
      ysq_sb_456: "21-high",
      ysq_ss_456: "32-very-high",
      ysq_ei_456: "12-medium",
      ysq_us_456: "35-very-high",
      ysq_et_456: "15-medium",
      ysq_is_456: "19-medium",
      ysq_as_456: "25-high",
      ysq_np_456: "19-medium",
      ysq_pu_456: "26-high",
    },
  });

  // Bob SMI - with randomised scores
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
      ...Object.fromEntries(
        Object.keys(smiBoundaries).map((key) => [key, generateScore(key)])
      ),
    },
  });

  // Carol BECKS
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
    },
  });

  // Dave BURNS
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
    },
  });

  // Emma multi forms
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
        bai_score: null,
        ysq_ed_score: "32-very-high",
        ysq_ab_score: "26-high",
        ysq_ma_score: "25-medium",
        ysq_si_score: "19-medium",
        ysq_ds_score: "12-low",
        ysq_fa_score: "30-high",
        ysq_di_score: "13-medium",
        ysq_vu_score: "31-very-high",
        ysq_eu_score: "20-medium",
        ysq_sb_score: "18-medium",
        ysq_ss_score: "29-high",
        ysq_ei_score: "9-low",
        ysq_us_score: "39-high",
        ysq_et_score: "31-very-high",
        ysq_is_score: "40-very-high",
        ysq_as_score: "13-medium",
        ysq_np_score: "8-low",
        ysq_pu_score: "12-low",
        ysq_ed_456: "27-high",
        ysq_ab_456: "20-medium",
        ysq_ma_456: "17-medium",
        ysq_si_456: "16-medium",
        ysq_ds_456: "9-low",
        ysq_fa_456: "24-medium",
        ysq_di_456: "11-low",
        ysq_vu_456: "28-high",
        ysq_eu_456: "15-medium",
        ysq_sb_456: "13-medium",
        ysq_ss_456: "25-high",
        ysq_ei_456: "7-low",
        ysq_us_456: "31-high",
        ysq_et_456: "26-high",
        ysq_is_456: "33-high",
        ysq_as_456: "10-low",
        ysq_np_456: "7-low",
        ysq_pu_456: "9-low",
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

  // Frank forms
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
