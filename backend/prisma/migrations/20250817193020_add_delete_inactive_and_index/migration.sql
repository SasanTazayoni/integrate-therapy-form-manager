-- CreateIndex
CREATE INDEX "Client_status_delete_inactive_idx" ON "public"."Client"("status", "delete_inactive");
