-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_clientId_fkey";

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
