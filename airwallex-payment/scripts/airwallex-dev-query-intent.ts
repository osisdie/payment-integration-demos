/**
 * CLI helper: query the latest payment intent or a specific one.
 *
 * Usage:
 *   pnpm airwallex:query                     # query latest from local DB
 *   pnpm airwallex:query -- int_hkXXX        # query specific intent from API
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const intentId = process.argv[2];

  if (intentId) {
    // Query live from Airwallex API.
    const { getAccessToken } = await import("../src/lib/airwallex/auth");
    const { airwallexBaseUrl, ENDPOINTS } = await import(
      "../src/lib/airwallex/config"
    );
    const token = await getAccessToken();
    const res = await fetch(
      `${airwallexBaseUrl()}${ENDPOINTS.getIntent(intentId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } else {
    // Query latest from local DB.
    const latest = await prisma.paymentIntent.findFirst({
      orderBy: { createdAt: "desc" },
      include: { refunds: true },
    });
    if (!latest) {
      console.log("No payment intents in the local database.");
      return;
    }
    console.log(JSON.stringify(latest, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
