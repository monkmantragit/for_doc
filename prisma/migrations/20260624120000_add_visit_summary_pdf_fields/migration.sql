-- Store a reference to the generated visit-summary PDF kept in Directus file
-- storage. Served privately through the authenticated admin proxy route.
ALTER TABLE "Appointment" ADD COLUMN "visitSummaryFileId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "visitSummaryGeneratedAt" TIMESTAMP(3);
