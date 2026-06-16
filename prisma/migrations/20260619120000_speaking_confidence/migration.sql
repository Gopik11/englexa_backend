-- CreateTable
CREATE TABLE "speaking_confidence" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "user_response" TEXT NOT NULL,
    "ai_feedback" TEXT NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_confidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "speaking_confidence_user_id_created_at_idx" ON "speaking_confidence"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "speaking_confidence" ADD CONSTRAINT "speaking_confidence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
