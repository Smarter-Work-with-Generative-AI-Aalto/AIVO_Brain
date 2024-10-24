-- CreateTable
CREATE TABLE "AIRequestQueue" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "documentIds" TEXT[],
    "userSearchQuery" TEXT NOT NULL,
    "sequentialQuery" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "individualFindings" JSONB,
    "overallSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRequestQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIActivityLog" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "documentIds" TEXT[],
    "userSearchQuery" TEXT NOT NULL,
    "sequentialQuery" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "individualFindings" JSONB,
    "overallSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
