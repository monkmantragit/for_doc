import React from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Link from 'next/link'; // Added Link for potential future use

export const metadata = {
  title: 'Appointment & Booking Information | Sports Orthopedics India',
  description: 'Find out how to manage your appointments, including checking your booking status, cancellations, rescheduling, and payment details at Sports Orthopedics India.',
};

const AppointmentBookingInfoPage = () => {
  // SOI Brand Colors - Patient Care Theme
  const brandColors = {
    primary: '#1e3a5f',    // SOI Navy - Medical Authority
    accent: '#d4a5b8',     // SOI Pink - Patient Care
    text: '#1e3a5f',       // SOI Navy - Professional Text
    lightText: '#2a4d6b',  // SOI Navy 700 - Readable Content
    background: '#FFFFFF', // Clean White
    lightGray: '#f8f4f6',  // SOI Pink 50 - Light Care Background
    success: '#a8c4a2',    // SOI Mint - Success States
    warning: '#d4a5b8',    // SOI Pink - Care/Attention
  };

  // Contact information
  const contactNumbers = [
    { display: "+91 6364538660", link: "tel:+916364538660" },
    { display: "+91 9008520831", link: "tel:+919008520831" },
    { display: "+91 80 41276853", link: "tel:+918041276853" },
  ];
  const contactEmail = "sportsorthopedics.in@gmail.com";

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 sm:py-12 bg-tint-care" style={{ color: brandColors.text }}>
        <article className="prose lg:prose-xl max-w-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center" style={{ color: brandColors.primary }}>
            Managing Your Appointment & Booking
          </h1>

          <section className="mb-10 sm:mb-12">
            <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
              At Sports Orthopedics India, we aim to make managing your appointments as straightforward as possible. Below you'll find information on how to check your booking, make changes, or understand our payment process.
            </p>
          </section>

          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              Checking Your Booking Status
            </h2>
            <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
              To check the status of your existing appointment, please contact our support desk directly. Our team will be happy to provide you with the latest information.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
              You can reach us at:
            </p>
            <div className="bg-white p-6 rounded-lg shadow-md border border-soi-pink-200 mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: brandColors.primary }}>Contact Information</h3>
              <div className="space-y-3">
                {contactNumbers.map(num => (
                  <div key={num.link} className="flex items-center">
                    <span className="font-medium mr-2" style={{ color: brandColors.text }}>Phone:</span>
                    <a href={num.link} className="font-medium hover:underline" style={{ color: brandColors.accent }}>{num.display}</a>
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="font-medium mr-2" style={{ color: brandColors.text }}>Email:</span>
                  <a href={`mailto:${contactEmail}`} className="font-medium hover:underline" style={{ color: brandColors.accent }}>{contactEmail}</a>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 sm:mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-soi-pink-200">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6" style={{ color: brandColors.primary }}>
                How to Cancel Your Appointment
              </h2>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                If you need to cancel your appointment, please inform us at your earliest convenience. This allows us to manage our schedule and offer the slot to another patient in need.
              </p>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                To cancel, please call our support desk using one of the numbers above or email us at <a href={`mailto:${contactEmail}`} className="font-medium hover:underline" style={{ color: brandColors.accent }}>{contactEmail}</a>.
              </p>
            </div>
          </section>

          <section className="mb-10 sm:mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-soi-pink-200">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6" style={{ color: brandColors.primary }}>
                Rescheduling Your Appointment
              </h2>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                We understand that plans can change. If you need to reschedule your appointment for a different time or date, please contact our support desk. Our team will assist you in finding a new suitable slot.
              </p>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                You can reach our support desk by calling one of the numbers listed above or emailing <a href={`mailto:${contactEmail}`} className="font-medium hover:underline" style={{ color: brandColors.accent }}>{contactEmail}</a>.
              </p>
            </div>
          </section>

          <section className="mb-10 sm:mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-soi-pink-200">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6" style={{ color: brandColors.primary }}>
                Payment Information
              </h2>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                All payments for consultations, treatments, and procedures are to be made directly at the clinic during your visit. We accept various modes of payment for your convenience.
              </p>
              <p className="mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg" style={{ color: brandColors.lightText }}>
                If you have any questions regarding payment methods or insurance, please feel free to discuss them with our front desk staff when you arrive or by contacting us in advance.
              </p>
            </div>
          </section>

           <section className="mb-10 sm:mb-12">
            <p className="text-center text-base sm:text-lg leading-relaxed" style={{ color: brandColors.text }}>
              For any further assistance or inquiries, please do not hesitate to <Link href="/contact" className="font-medium hover:underline" style={{ color: brandColors.accent }}>contact us</Link>.
            </p>
          </section>

        </article>
      </main>
      <SiteFooter />
    </>
  );
};

export default AppointmentBookingInfoPage; 