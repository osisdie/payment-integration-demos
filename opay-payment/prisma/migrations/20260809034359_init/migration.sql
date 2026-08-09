-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "platformId" TEXT,
    "name" TEXT NOT NULL,
    "hashKey" TEXT NOT NULL,
    "hashIv" TEXT NOT NULL,
    "invoiceHashKey" TEXT,
    "invoiceHashIv" TEXT,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "merchantTradeNo" TEXT NOT NULL,
    "tradeNo" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "tradeDesc" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "rtnCode" INTEGER,
    "rtnMsg" TEXT,
    "twqrCode" TEXT,
    "twqrExpireDate" TEXT,
    "platformId" TEXT,
    "customField1" TEXT,
    "customField2" TEXT,
    "creditInstallment" TEXT,
    "tradeDate" TEXT,
    "paymentDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "relateNumber" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "invoiceDate" TEXT,
    "randomNumber" TEXT,
    "customerIdentifier" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "customerAddr" TEXT,
    "print" TEXT NOT NULL DEFAULT '0',
    "donation" TEXT NOT NULL DEFAULT '0',
    "loveCode" TEXT,
    "carrierType" TEXT,
    "carrierNum" TEXT,
    "taxType" TEXT NOT NULL DEFAULT '1',
    "salesAmount" INTEGER NOT NULL,
    "invType" TEXT NOT NULL DEFAULT '07',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "voidReason" TEXT,
    "platformId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT,
    CONSTRAINT "Invoice_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("merchantId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "merchantTradeNo" TEXT NOT NULL,
    "tradeNo" TEXT,
    "action" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rtnCode" INTEGER,
    "rtnMsg" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchantId_key" ON "Merchant"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_merchantTradeNo_key" ON "Order"("merchantTradeNo");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_relateNumber_key" ON "Invoice"("relateNumber");
