-- Add engagedAt timestamp for the in-consultation step between check-in and check-out
ALTER TABLE "Appointment" ADD COLUMN "engagedAt" TIMESTAMP(3);
