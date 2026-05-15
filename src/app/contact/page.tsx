import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ContactForm from './components/ContactForm';
import SchemaMarkup from '@/components/SchemaMarkup';
import { createMedicalClinicSchema, createBreadcrumbSchema, createLocalBusinessSchema } from '@/lib/schema/utils';

export const metadata: Metadata = {
  title: 'Contact Us | Sports Orthopedics',
  description: 'Get in touch with our orthopedic specialists. We\'re here to help with all your orthopedic needs and questions.',
};

export default function ContactPage() {
  // Create schema markup for the contact page
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://sportsorthopedics.in';
  const schemas = [
    createMedicalClinicSchema(),
    createLocalBusinessSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: baseUrl },
      { name: 'Contact Us' }
    ])
  ];

  return (
    <div className="min-h-screen bg-tint-care">
      <SchemaMarkup schema={schemas} />
      <SiteHeader theme="light" />
      
      <main className="pt-24 md:pt-32 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/default-hero.jpg"
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-soi-navy-700/85 via-soi-navy-800/85 to-soi-pink-600/70" />
          </div>
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
              <p className="text-lg text-white/90">
                Have questions about our procedures or want to schedule an appointment?
                Our team is here to help you with all your orthopedic needs.
              </p>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-24 border border-soi-pink-200 shadow-sm">
                <h2 className="text-2xl font-semibold text-soi-navy-800 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-soi-pink-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-soi-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-soi-navy-800 mb-1">Our Location</h3>
                      <p className="text-soi-navy-600 text-sm">
                        1084, 2nd Floor, Shirish Foundation,<br />
                        14th Main, 18th Cross, Sector 3,<br />
                        HSR Layout, Bengaluru - 560102
                      </p>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-soi-pink-100 rounded-lg">
                      <Phone className="w-6 h-6 text-soi-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-soi-navy-800 mb-1">Call Us</h3>
                      <div className="space-y-1">
                        <a href="tel:+916364538660" className="block text-soi-navy-600 text-sm hover:text-soi-pink-600">
                          +91 6364538660
                        </a>
                        <a href="tel:+919008520831" className="block text-soi-navy-600 text-sm hover:text-soi-pink-600">
                          +91 9008520831
                        </a>
                        <a href="tel:+918041276853" className="block text-soi-navy-600 text-sm hover:text-soi-pink-600">
                          +91 80 41276853
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-soi-pink-100 rounded-lg">
                      <Mail className="w-6 h-6 text-soi-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-soi-navy-800 mb-1">Email Us</h3>
                      <a href="mailto:sportsorthopedics.in@gmail.com" className="text-soi-navy-600 text-sm hover:text-soi-pink-600">
                        sportsorthopedics.in@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-soi-pink-100 rounded-lg">
                      <Clock className="w-6 h-6 text-soi-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-soi-navy-800 mb-1">Working Hours</h3>
                      <p className="text-soi-navy-600 text-sm">
                        Monday - Saturday: 9:00 AM - 6:00 PM<br />
                        Sunday: By appointment only<br />
                        (Emergencies through Manipal ER)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-soi-pink-200">
                  <Link 
                    href="/procedure-surgery"
                    className="flex items-center gap-2 text-soi-navy-600 font-medium hover:text-soi-pink-600 hover:underline"
                  >
                    <span>View our procedures</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Contact Form and Map */}
            <div className="lg:col-span-2 space-y-8">
              {/* Form */}
              <div className="bg-white rounded-xl border border-soi-pink-200 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-soi-navy-800 mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
              
              {/* Map */}
              <div className="bg-white rounded-xl border border-soi-pink-200 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-soi-navy-800 mb-4">Find Us</h2>
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9339623430733!2d77.6387069!3d12.9119659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae154f9c34faf7%3A0x20d81f3cad291c58!2sSports%20Orthopedics%20Institute%20%7C%20Dr%20Naveen%20Kumar%20LV%20%7C%20Knee%20Shoulder%20Hip%20Ankle%20Elbow%20Wrist%20Surgeon%20%26%20Sports%20Injury%20Specialist!5e0!3m2!1sen!2sin!4v1746568791014!5m2!1sen!2sin" 
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="mt-4 text-center">
                  <a 
                    href="https://maps.google.com/?q=Sports+Orthopedics+HSR+Layout+Bangalore" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-soi-navy-600 font-medium hover:text-soi-pink-600 hover:underline"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 