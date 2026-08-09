-- CreateTable
CREATE TABLE "CheckoutPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "customerEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubscriptionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutPayment_stripeCheckoutSessionId_key" ON "CheckoutPayment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionRecord_stripeSubscriptionId_key" ON "SubscriptionRecord"("stripeSubscriptionId");
