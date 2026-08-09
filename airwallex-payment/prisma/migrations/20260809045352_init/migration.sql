-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airwallexIntentId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "descriptor" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'INITIAL',
    "paymentMethod" TEXT,
    "merchantOrderId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airwallexRefundId" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Refund_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_airwallexIntentId_key" ON "PaymentIntent"("airwallexIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_requestId_key" ON "PaymentIntent"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_airwallexRefundId_key" ON "Refund"("airwallexRefundId");
