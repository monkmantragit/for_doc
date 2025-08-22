import { Metadata } from 'next';
import Image from 'next/image';
import React from 'react';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, GraduationCap, Medal, User, FileText, Building, Users, Stethoscope, Globe, Bookmark, Heart, Phone, Calendar, ChevronRight, MapPin, Mail } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import BookingButton from '@/components/BookingButton';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { getStaffMemberBySlugAction, getRelatedStaffAction } from '../actions';
import { StaffMember } from '@/types/staff';
import SchemaMarkup from '@/components/SchemaMarkup';
import { createPhysicianSchema, createBreadcrumbSchema, sanitizeForSchema } from '@/lib/schema/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const staffMember = await getStaffMemberBySlugAction(params.slug);
  
  if (!staffMember) {
    return {
      title: 'Staff Member Not Found',
    };
  }

  const name = staffMember.title;
  
  return {
    title: `${name} | Sports Orthopedics Institute`,
    description: staffMember.meta_description || staffMember.excerpt || `Meet ${name}, a dedicated member of our expert healthcare team at Sports Orthopedics Institute.`,
    openGraph: {
      title: staffMember.meta_title || `${name} | Sports Orthopedics Institute`,
      description: staffMember.meta_description || staffMember.excerpt || `Meet ${name}, a dedicated member of our expert healthcare team.`,
      images: staffMember.featured_image_url ? [
        {
          url: staffMember.featured_image_url,
          width: 1200,
          height: 630,
          alt: name,
        }
      ] : [],
    },
  };
}

function extractImageUrl(staffMember: StaffMember, slug?: string): string {
  // First try featured image from Directus
  if (staffMember.featured_image_url) {
    return staffMember.featured_image_url;
  }
  
  // For specific doctors, use their custom images (legacy compatibility)
  if (slug === 'dr-sameer-km') {
    return '/images/dr-sameer.webp';
  }
  
  if (slug === 'dr-naveen-kumar-l-v') {
    return '/images/naveen.jpg';
  }
  
  if (slug === 'shama-kellogg') {
    return '/images/shama-kellogg.webp';
  }
  
  return '/placeholder-staff.jpg';
}

function extractPosition(staffMember: StaffMember): string {
  // Use category as position or extract from title
  if (staffMember.category) {
    return staffMember.category;
      }
  
  // If title contains position info after |, extract it
  const titleParts = staffMember.title.split('|');
  if (titleParts.length > 1) {
    return titleParts[1].trim();
        }
  
  return 'Team Member';
}

export default async function StaffMemberPage({ params }: { params: { slug: string } }) {
  const staffMember = await getStaffMemberBySlugAction(params.slug);
  
  if (!staffMember) {
    return (
      <div className="min-h-screen bg-tint-care flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-soi-navy-800 mb-4">Staff Member Not Found</h1>
          <Link href="/surgeons-staff" className="text-soi-pink-600 hover:text-soi-navy-600">
            ← Back to Team
          </Link>
        </div>
          </div>
    );
  }

  // Get related staff members
  const relatedStaff = await getRelatedStaffAction(staffMember.id, staffMember.category || '', 3);

  const name = staffMember.title.split('|')[0].trim();
  const position = extractPosition(staffMember);
  const imageUrl = extractImageUrl(staffMember, params.slug);

  // Extract any available description for hero section
  const heroDescription = staffMember.excerpt || 
    (staffMember.content_text ? staffMember.content_text.slice(0, 150) + '...' : null);

  // Create schema markup for the physician/staff member
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://sportsorthopedics.in';
  const schemas = [
    createPhysicianSchema({
      name: name,
      url: `${baseUrl}/surgeons-staff/${params.slug}`,
      image: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
      jobTitle: position,
      description: sanitizeForSchema(staffMember.content_text || heroDescription),
      medicalSpecialty: ['Orthopedic', 'SportsMedicine'],
      hospitalAffiliation: undefined,
      alumniOf: undefined
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: baseUrl },
      { name: 'Our Team', url: `${baseUrl}/surgeons-staff` },
      { name: name }
    ])
  ];

  return (
    <div className="min-h-screen bg-tint-care">
      <SchemaMarkup schema={schemas} />
      <SiteHeader theme="transparent" />
      
      <main>
        {/* Hero Section - More refined */}
        <section className="relative bg-gradient-to-br from-soi-navy-700 via-soi-navy-600 to-soi-navy-800 pt-20 pb-10">
          <Container>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/surgeons-staff" className="hover:text-white transition-colors">Our Team</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">{name}</span>
            </nav>

            {/* Hero Content - More compact layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <div className="order-2 lg:order-1">
                <div className="inline-block bg-soi-pink-500/20 text-white px-3 py-1 rounded-md text-xs font-medium mb-4 border border-soi-pink-500/30">
                  {position.toUpperCase()}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {name}
                </h1>
                {/* Always maintain consistent spacing, show description if available */}
                <div className="mb-6 min-h-[60px] flex items-center">
                  {heroDescription ? (
                    <p className="text-white/80 leading-relaxed">
                      {heroDescription}
                    </p>
                  ) : (
                    <p className="text-white/60 leading-relaxed">
                      Dedicated healthcare professional at Sports Orthopedics Institute.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <BookingButton 
                    className="bg-soi-navy-500 hover:bg-soi-navy-600 text-white px-6 py-2.5 text-sm rounded-lg font-medium transition-all duration-300 hover:shadow-lg border-2 border-soi-pink-400"
                    icon={null}
                    text="Book an Appointment"
                  />
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-white/25 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Contact Us
                    <Mail className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Image - Always show with consistent layout */}
              <div className="relative order-1 lg:order-2">
                <div className="relative w-full max-w-xs mx-auto lg:max-w-sm">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-soi-pink-500/20 to-transparent z-10"></div>
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover object-top rounded-xl shadow-lg"
                      sizes="(max-width: 1024px) 300px, 400px"
                    />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-soi-pink-500 rounded-full flex items-center justify-center shadow-lg z-20">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Main Content - Better spacing */}
        <section className="py-10 px-4 md:px-8 lg:px-12">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Always show with fallback content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-soi-pink-500 mr-2" />
                    <h2 className="text-xl font-bold text-soi-navy-800">About {name}</h2>
                  </div>
                  
                  {/* Show content with graceful fallbacks */}
                  {staffMember.content_html ? (
                    <div 
                      className="prose prose-gray max-w-none text-soi-navy-600 prose-headings:text-soi-navy-800 prose-links:text-soi-pink-600 prose-links:hover:text-soi-navy-600 prose-p:text-sm prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: staffMember.content_html }}
                    />
                  ) : staffMember.content_text ? (
                    <div className="text-soi-navy-600 whitespace-pre-wrap leading-relaxed text-sm">
                      {staffMember.content_text}
                    </div>
                  ) : staffMember.excerpt ? (
                    <p className="text-soi-navy-600 leading-relaxed">{staffMember.excerpt}</p>
                  ) : (
                    <div className="text-soi-navy-600 leading-relaxed">
                      <p className="mb-3">
                        {name} is a valued member of our professional team at Sports Orthopedics Institute.
                      </p>
                      <p>
                        Our team is dedicated to providing exceptional care and expertise in orthopedic and sports medicine.
                      </p>
                    </div>
                  )}
                </div>

                {/* Always show info cards with consistent layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center mb-3">
                      <Award className="h-5 w-5 text-soi-pink-500 mr-2" />
                      <h3 className="font-semibold text-soi-navy-800">Specialization</h3>
                    </div>
                    <p className="text-soi-navy-600 text-sm">{position || 'Healthcare Professional'}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center mb-3">
                      <Building className="h-5 w-5 text-soi-pink-500 mr-2" />
                      <h3 className="font-semibold text-soi-navy-800">Department</h3>
                    </div>
                    <p className="text-soi-navy-600 text-sm">{staffMember.category || 'Sports Orthopedics'}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar - Always consistent layout */}
              <div className="space-y-4">
                {/* Quick Contact - Always show */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-semibold text-soi-navy-800 mb-4">Quick Contact</h3>
                  <div className="space-y-2">
                    <BookingButton 
                      className="w-full bg-soi-navy-500 hover:bg-soi-navy-600 text-white py-2.5 text-sm rounded-md font-medium transition-all duration-300 shadow-sm border-2 border-soi-pink-400"
                      icon={null}
                      text="Book an Appointment"
                    />
                    <Link
                      href="/contact"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-soi-pink-50 hover:bg-soi-pink-100 text-soi-navy-700 hover:text-soi-navy-800 text-sm font-medium rounded-md transition-all duration-300 border border-soi-pink-200"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Office
                    </Link>
                  </div>
                </div>

                {/* Professional Info - Show available fields gracefully */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-semibold text-soi-navy-800 mb-3">Professional Info</h3>
                  <div className="space-y-3">
                    {/* Always show position */}
                    <div className="flex items-start">
                      <Award className="h-4 w-4 text-soi-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-soi-navy-700">Position</p>
                        <p className="text-sm text-soi-navy-600">{position || 'Healthcare Professional'}</p>
                      </div>
                    </div>
                    
                    {/* Always show department */}
                    <div className="flex items-start">
                      <Building className="h-4 w-4 text-soi-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-soi-navy-700">Department</p>
                        <p className="text-sm text-soi-navy-600">{staffMember.category || 'Sports Orthopedics'}</p>
                      </div>
                    </div>
                    
                    {/* Show reading time only if available */}
                    {staffMember.reading_time && (
                      <div className="flex items-start">
                        <BookOpen className="h-4 w-4 text-soi-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-soi-navy-700">Profile Length</p>
                          <p className="text-sm text-soi-navy-600">{staffMember.reading_time} min read</p>
                        </div>
                      </div>
                    )}
                    

                  </div>
                </div>

                {/* Back to Team - Always show */}
                <div className="bg-gradient-to-br from-soi-pink-100 to-soi-pink-50 rounded-lg p-4">
                  <h3 className="font-semibold text-soi-navy-800 mb-2">Our Team</h3>
                  <p className="text-soi-navy-600 text-sm mb-3">
                    Discover more about our expert healthcare professionals.
                  </p>
          <Link 
            href="/surgeons-staff" 
                    className="inline-flex items-center text-soi-pink-600 text-sm font-medium hover:text-soi-navy-600 transition-colors"
          >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    View All Team Members
          </Link>
        </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Related Staff - Show if available, otherwise skip gracefully */}
        {relatedStaff.length > 0 && (
          <section className="py-10 px-4 md:px-8 lg:px-12 bg-white border-t border-gray-100">
            <Container>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-soi-navy-800 mb-3">Meet More Team Members</h2>
                <p className="text-soi-navy-600 text-sm">
                  Other professionals in our {staffMember.category || 'healthcare'} department
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedStaff.map((staff) => (
                  <Link key={staff.id} href={`/surgeons-staff/${staff.slug}`}>
                    <StaffCard
                      staff={{
                        slug: staff.slug,
                        name: staff.title,
                        title: staff.category || '',
                        qualifications: staff.excerpt || '',
                        imageUrl: staff.featured_image_url || '/placeholder-staff.jpg'
                      }}
            />
                  </Link>
          ))}
        </div>
      </Container>
          </section>
        )}

        {/* Call to Action - Always show */}
        <section className="py-10 px-4 md:px-8 lg:px-12 bg-soi-navy-700">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Schedule a consultation with {name} and our expert team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <BookingButton 
                  className="bg-soi-navy-500 hover:bg-soi-navy-600 text-white px-6 py-3 font-medium rounded-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto border-2 border-soi-pink-400"
                  icon={null}
                  text="Book an Appointment"
                />
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-white/25 text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  Contact Our Office
                  <Phone className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
} 