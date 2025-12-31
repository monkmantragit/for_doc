import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { UserPlus, Users, Award, Phone, ArrowRight, Filter, Calendar, Activity } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import HeroSection from '@/components/ui/HeroSection';
import React from 'react'; 
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStaffWithFilters, getStaffCategoriesAction } from './actions';
import { StaffMember } from '@/types/staff';
import { Container } from '@/components/ui/container';
import { getPublicImageUrl } from '@/lib/directus';

export const metadata: Metadata = {
  title: 'Our Expert Team | Sports Orthopedics Institute',
  description: 'Meet our world-class team of orthopedic surgeons, sports medicine specialists, physiotherapists, and healthcare professionals dedicated to your recovery.',
};

// Helper function to group staff by category
function groupStaffByCategory(staffList: StaffMember[]) {
  return staffList.reduce((acc, staff) => {
    const category = staff.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(staff);
    return acc;
  }, {} as Record<string, StaffMember[]>);
}

interface StaffPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SurgeonsStaffPage({ searchParams }: StaffPageProps) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

  // Fetch staff data from Directus
  const staffResponse = await getStaffWithFilters({
    category,
    page,
    limit: 50 // Get all staff for grouping
  });

  const allStaff = staffResponse.staff;
  const categories = staffResponse.categories;

  // Group staff by category for organized display
  const groupedStaff = groupStaffByCategory(allStaff);
  
  // Debug: Log available categories
  console.log('Available categories:', Object.keys(groupedStaff));
  console.log('All staff:', allStaff.map(s => ({ title: s.title, category: s.category })));

  // Define category mapping with icons - Dr. Naveen first, Associate Consultant MUST be 2nd, Clinic Staff last
  const categoryConfig: Record<string, { title: string; icon: any; priority: number }> = {
    'Director': { title: 'Director', icon: Award, priority: 1 },
    'Associate Consultant': { title: 'Associate Consultant', icon: Award, priority: 2 }, // MUST be 2nd - using exact category name
    'Consultant': { title: 'Associate Consultant', icon: Award, priority: 2 }, // Backup for different naming
    'Sports Shoulder Clinic': { title: 'Sports Shoulder Clinic', icon: Activity, priority: 2.5 }, // Specialized sports shoulder department
    'Sports Psychologist': { title: 'Sports Psychologist', icon: UserPlus, priority: 3 },
    'Sports Orthopedics Fellows': { title: 'Sports Orthopedics Fellows', icon: Users, priority: 4 },
    'Physiotherapists': { title: 'Physiotherapists', icon: UserPlus, priority: 5 },
    'Manipal Hospital Staff': { title: 'Manipal Hospital Staff', icon: Users, priority: 6 },
    'Other': { title: 'Other Team Members', icon: Users, priority: 7 },
    'Staff': { title: 'Clinic Staff', icon: Users, priority: 999 }, // Moved to last
  };

  // Sort categories by priority
  const sortedCategories = Object.keys(groupedStaff).sort((a, b) => {
    const priorityA = categoryConfig[a]?.priority || 999;
    const priorityB = categoryConfig[b]?.priority || 999;
    return priorityA - priorityB;
  });

  return (
    <div className="min-h-screen bg-tint-care">
      <SiteHeader theme="transparent" />
      
      <main>
        {/* Hero Section - More subtle and refined */}
        <section className="relative bg-gradient-to-br from-soi-navy-600 via-soi-navy-700 to-soi-navy-800 pt-20 pb-12">
          <Container>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/80">Our Team</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block bg-soi-pink-500/10 text-white px-3 py-1 rounded-md text-xs font-medium mb-4 border border-soi-pink-500/20">
                EXPERT MEDICAL TEAM
            </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Meet Our Expert Team
            </h1>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                World-class orthopedic surgeons, sports medicine specialists, and healthcare professionals dedicated to your recovery.
            </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
                <BookingButton 
                  className="bg-soi-navy-500 hover:bg-soi-navy-600 text-white px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto border-2 border-soi-pink-400"
                  icon={null}
                  text="Book an Appointment"
                />
                <a 
                  href="#team-members"
                  className="inline-flex items-center px-6 py-2.5 border border-white/25 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  View Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                                      </div>
                                  </div>
          </Container>
        </section>

        {/* Filter Section - More compact */}
        <section className="py-8 px-4 md:px-8 lg:px-12 bg-white border-b border-soi-pink-200">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-soi-navy-700 mb-3">Filter by Department</h3>
                <div className="flex flex-wrap gap-2">
                                        <Link 
                    href="/surgeons-staff"
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md border transition-all duration-200",
                      !category
                        ? "bg-soi-navy-500 text-white border-soi-navy-500"
                        : "bg-white text-soi-navy-600 border-soi-pink-200 hover:border-soi-pink-400 hover:text-soi-pink-600"
                    )}
                  >
                    All ({allStaff.length})
                                        </Link>
                  
                  {categories.filter(cat => cat !== 'All').map((cat) => (
                    <Link
                      key={cat}
                      href={`/surgeons-staff?category=${encodeURIComponent(cat)}`}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md border transition-all duration-200",
                        category === cat
                          ? "bg-soi-navy-500 text-white border-soi-navy-500"
                          : "bg-white text-soi-navy-600 border-soi-pink-200 hover:border-soi-pink-400 hover:text-soi-pink-600"
                      )}
                    >
                      {categoryConfig[cat]?.title || cat} ({groupedStaff[cat]?.length || 0})
                                        </Link>
                  ))}
                                  </div>
                              </div>
                          </div>
          </Container>
        </section>

        {/* Team Members Section - Better spacing */}
        <section id="team-members" className="py-12 px-4 md:px-8 lg:px-12">
          <Container>
            {category ? (
              // Show filtered category
              <>
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-3">
                    {categoryConfig[category]?.title || category}
                  </h2>
                  <p className="text-soi-navy-600">
                    {groupedStaff[category]?.length || 0} team member{(groupedStaff[category]?.length || 0) !== 1 ? 's' : ''} in this department
                  </p>
              </div>

                {groupedStaff[category] && groupedStaff[category].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedStaff[category].map((staff) => (
                      <Link key={staff.id} href={`/surgeons-staff/${staff.slug}`}>
                        <StaffCard
                          staff={{
                            slug: staff.slug,
                            name: staff.title,
                            title: staff.category || '',
                            qualifications: staff.excerpt || '',
                            imageUrl: staff.featured_image_url || ''
                          }}
                        />
                      </Link>
                    ))}
                                </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="max-w-sm mx-auto">
                      <Users className="h-12 w-12 text-soi-pink-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-soi-navy-800 mb-2">No team members found</h3>
                      <p className="text-soi-navy-600 text-sm">No team members found in this category.</p>
                                </div>
                            </div>
                )}
              </>
            ) : (
              // Show all categories
              <>
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-soi-navy-800 mb-3">Our Complete Team</h2>
                  <p className="text-soi-navy-600 max-w-2xl mx-auto">
                    Our multidisciplinary team provides comprehensive care across all aspects of orthopedic and sports medicine.
                                    </p>
                                </div>

                {sortedCategories.map((categoryKey) => {
                  const categoryStaff = groupedStaff[categoryKey];
                  const config = categoryConfig[categoryKey] || { title: categoryKey, icon: Users, priority: 999 };
                  const IconComponent = config.icon;

                  return (
                    <div key={categoryKey} className="mb-12">
                      <div className="flex items-center mb-6 pb-3 border-b border-soi-pink-200">
                        <IconComponent className="h-6 w-6 text-soi-pink-500 mr-3" />
                        <h3 className="text-xl md:text-2xl font-bold text-soi-navy-800">{config.title}</h3>
                        <span className="ml-3 text-xs text-soi-navy-500 bg-soi-pink-100 px-2 py-1 rounded-full">
                          {categoryStaff.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {categoryStaff.map((staff) => (
                          <Link key={staff.id} href={`/surgeons-staff/${staff.slug}`}>
                            <StaffCard
                              staff={{
                                slug: staff.slug,
                                name: staff.title,
                                title: staff.category || '',
                                qualifications: staff.excerpt || '',
                                imageUrl: staff.featured_image_url || ''
                              }}
                            />
                          </Link>
                        ))}
                            </div>
                       </div>
                      );
                    })}
              </>
            )}
          </Container>
          </section>

        {/* Call to Action - More subtle */}
        <section className="py-12 px-4 md:px-8 lg:px-12 bg-soi-navy-600">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Meet Our Team?
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Schedule a consultation with our expert team to discuss your treatment options.
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
                  Contact Us
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