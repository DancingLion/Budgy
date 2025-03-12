-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
