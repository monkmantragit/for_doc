'use client'; // Needed for setIsBookingModalOpen if passed as prop, or keep server-side if modal logic is elsewhere

import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
// import { useState } from 'react'; // Removed useState as it's no longer used
import BookingModal from '@/components/booking/BookingModal'; // Keep BookingModal import if needed elsewhere, otherwise remove

// Define props if Book an Appointment needs to trigger a modal managed by the parent layout/page
// interface SiteFooterProps {
//   onBookAppointmentClick: () => void;
// }

export default function SiteFooter(/*{ onBookAppointmentClick }: SiteFooterProps*/) {
  // const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // Removed state for modal

  // Removed handleBookAppointment function as it's no longer used
  // const handleBookAppointment = () => {
  //   setIsBookingModalOpen(true); // Set state to open modal
  //   // ... other options ...
  // };

  return (
    <footer className="bg-soi-navy-700 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Google Map */}
          <div className="relative h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9339623430733!2d77.6387069!3d12.9119659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae154f9c34faf7%3A0x20d81f3cad291c58!2sSports%20Orthopedics%20Institute%20%7C%20Dr%20Naveen%20Kumar%20LV%20%7C%20Knee%20Shoulder%20Hip%20Ankle%20Elbow%20Wrist%20Surgeon%20%26%20Sports%20Injury%20Specialist!5e0!3m2!1sen!2sin!4v1746568791014!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border:0 }}
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 border-0"
              title="Sports Orthopedics Institute Location"
            ></iframe>
          </div>

          {/* Useful Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
              Useful Links
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-soi-mint-400 to-transparent"></div>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', href: '/' },
                { name: 'Surgeons & Staff', href: '/surgeons-staff' },
                { name: 'Procedures', href: '/procedure-surgery' },
                { name: 'Bone & Joint School', href: '/bone-joint-school' },
                { name: 'Clinical Videos', href: '/clinical-videos' },
                { name: 'Publications', href: '/publications' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'Blogs', href: '/blogs' },
                { name: 'Contact', href: '/contact' },
                { name: 'Book an Appointment', href: '/book-appointment' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-soi-mint-400 transition-colors duration-300 flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-soi-mint-400" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
              Contact
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-soi-mint-400 to-transparent"></div>
            </h3>
            <div className="space-y-5">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-soi-mint-400 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-300">
                  1084, 2nd Floor, Shirish Foundation, 14th Main, 18th Cross, Sector 3, HSR Layout, Bengaluru - 560102
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-soi-mint-400 mr-3 flex-shrink-0" />
                  <a href="tel:+916364538660" className="text-gray-300 hover:text-soi-mint-400 transition-colors duration-300">
                    +91 6364538660
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-transparent mr-3 flex-shrink-0" />{/* Spacer */}
                  <a href="tel:+919008520831" className="text-gray-300 hover:text-soi-mint-400 transition-colors duration-300">
                    +91 9008520831
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-transparent mr-3 flex-shrink-0" />{/* Spacer */}
                  <a href="tel:+918041276853" className="text-gray-300 hover:text-soi-mint-400 transition-colors duration-300">
                    +91 80 41276853
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-soi-mint-400 mr-3 flex-shrink-0" />
                <a href="mailto:sportsorthopedics.in@gmail.com" className="text-gray-300 hover:text-soi-mint-400 transition-colors duration-300">
                  sportsorthopedics.in@gmail.com
                </a>
              </div>
              
              {/* Social Media Links */}
              <div className="flex space-x-4 pt-4">
                <a href="https://www.instagram.com/drnaveenkumarlv" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-soi-navy-600 flex items-center justify-center hover:bg-soi-mint-500 group transition-colors duration-300">
                  <Instagram className="w-5 h-5 text-soi-mint-400 group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=100064057982646" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-soi-navy-600 flex items-center justify-center hover:bg-soi-mint-500 group transition-colors duration-300">
                  <Facebook className="w-5 h-5 text-soi-mint-400 group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://x.com/Naveen_Lokikere" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-soi-navy-600 flex items-center justify-center hover:bg-soi-mint-500 group transition-colors duration-300">
                  <Twitter className="w-5 h-5 text-soi-mint-400 group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://www.linkedin.com/in/dr-naveen-kumar-lv/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-soi-navy-600 flex items-center justify-center hover:bg-soi-mint-500 group transition-colors duration-300">
                  <Linkedin className="w-5 h-5 text-soi-mint-400 group-hover:text-white transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-soi-navy-600 text-center">
          <p className="text-gray-400 text-sm">
            © 2018-{new Date().getFullYear()} Sports Orthopedics Institute and Research Foundation. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
} 