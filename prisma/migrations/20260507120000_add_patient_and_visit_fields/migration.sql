-- AlterTable: add patient link + visit lifecycle fields to Appointment
ALTER TABLE "Appointment"
  ADD COLUMN "patientId"  TEXT,
  ADD COLUMN "visitNotes" TEXT,
  ADD COLUMN "diagnosis"  TEXT,
  ADD COLUMN "checkInAt"  TIMESTAMP(3),
  ADD COLUMN "checkOutAt" TIMESTAMP(3);

-- CreateTable: Patient
CREATE TABLE "Patient" (
  "id"             TEXT NOT NULL,
  "phone"          TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "nameKey"        TEXT NOT NULL,
  "email"          TEXT,
  "dateOfBirth"    TIMESTAMP(3),
  "gender"         TEXT,
  "address"        TEXT,
  "medicalHistory" TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- Indexes for Patient
CREATE UNIQUE INDEX "Patient_phone_nameKey_key" ON "Patient"("phone", "nameKey");
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX "Patient_name_idx"  ON "Patient"("name");

-- Indexes on Appointment for fast lookup
CREATE INDEX "Appointment_date_idx"      ON "Appointment"("date");
CREATE INDEX "Appointment_phone_idx"     ON "Appointment"("phone");
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- Foreign key: Appointment.patientId -> Patient.id
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
