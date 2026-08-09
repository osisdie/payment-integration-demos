import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed a test merchant with stage credentials
  await prisma.merchant.upsert({
    where: { merchantId: "2000132" },
    create: {
      merchantId: "2000132",
      name: "OPay Stage Test Merchant",
      hashKey: "5294y06JbISpM5x9",
      hashIv: "v77hoKGq4kWxNNIS",
      invoiceHashKey: "ejCk326UnaZWKisg",
      invoiceHashIv: "q9jcZX8Ib9LM8wYk",
      isTestMode: true,
    },
    update: {},
  });

  // Seed TWQR test merchant
  await prisma.merchant.upsert({
    where: { merchantId: "2032990" },
    create: {
      merchantId: "2032990",
      name: "OPay Stage TWQR Merchant",
      hashKey: "zZ3TY0OnRvh1S1Sy",
      hashIv: "IJpIyW5lGSISNPZv",
      isTestMode: true,
    },
    update: {},
  });

  console.log("✅ Seeded test merchants");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
