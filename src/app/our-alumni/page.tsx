import type { Metadata } from 'next';
import Image from 'next/image';
import { GraduationCap, Briefcase, MapPin, Quote, Award, Users } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import HeroSection from '@/components/ui/HeroSection';
import { getAlumni } from '@/lib/directus';

// Content is managed in the Directus portal, so render on every request to
// always reflect the latest published alumni (no stale build-time snapshot).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Hall of Fame – Our Alumni | Sports Orthopedics Institute',
    description:
        'Meet the alumni of Sports Orthopedics Institute — the fellows and surgeons who trained with us and now lead orthopedic care across the country and beyond.',
};

export default async function OurAlumniPage() {
    const alumni = await getAlumni();

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <SiteHeader theme="transparent" />

            {/* Hero */}
            <HeroSection
                variant="image"
                height="medium"
                bgColor="#1e3a5f"
                bgImage="/images/team-hero.jpg"
                title={
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-block bg-soi-purple-500/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-purple-500/30">
                            HALL OF FAME
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                            OUR ALUMNI
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
                            Celebrating the fellows and surgeons who trained with us and now lead orthopedic care across the country and around the world.
                        </p>
                    </div>
                }
            />

            <main className="flex-grow">
                <div className="container mx-auto px-4 py-16 md:py-20 max-w-7xl">
                    {alumni.length > 0 ? (
                        <>
                            {/* Section intro */}
                            <div className="text-center mb-12 md:mb-16">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-soi-purple-100 text-soi-purple-700 rounded-full text-sm font-medium mb-4">
                                    <Users className="w-4 h-4" />
                                    <span>
                                        {alumni.length} Distinguished {alumni.length === 1 ? 'Alumnus' : 'Alumni'}
                                    </span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-900 mb-4">
                                    Where Our Fellows Are Now
                                </h2>
                                <p className="text-lg text-soi-navy-600 max-w-2xl mx-auto">
                                    Our alumni carry forward a legacy of excellence in orthopedics, arthroscopy, and arthroplasty.
                                </p>
                            </div>

                            {/* Alumni grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {alumni.map((person) => (
                                    <article
                                        key={person.id}
                                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                                    >
                                        {/* Photo */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-soi-navy-100">
                                            {person.photoUrl ? (
                                                <Image
                                                    src={person.photoUrl}
                                                    alt={person.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-soi-navy-100 to-soi-purple-100">
                                                    <span className="text-5xl font-bold text-soi-navy-300">
                                                        {person.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            )}
                                            {person.batch_year && (
                                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-soi-navy-900/85 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                                                    <Award className="w-3 h-3 text-soi-mint-300" />
                                                    Batch {person.batch_year}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="p-5 flex flex-col gap-2 flex-grow">
                                            <h3 className="text-lg font-bold text-soi-navy-900 leading-snug">
                                                {person.name}
                                            </h3>

                                            {person.qualification && (
                                                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-soi-purple-600">
                                                    <GraduationCap className="w-4 h-4 flex-shrink-0" />
                                                    {person.qualification}
                                                </p>
                                            )}

                                            {person.current_position && (
                                                <p className="inline-flex items-start gap-1.5 text-sm text-soi-navy-700">
                                                    <Briefcase className="w-4 h-4 flex-shrink-0 mt-0.5 text-soi-navy-400" />
                                                    <span>
                                                        {person.current_position}
                                                        {person.hospital ? (
                                                            <span className="text-soi-navy-500">, {person.hospital}</span>
                                                        ) : null}
                                                    </span>
                                                </p>
                                            )}

                                            {!person.current_position && person.hospital && (
                                                <p className="inline-flex items-center gap-1.5 text-sm text-soi-navy-700">
                                                    <Briefcase className="w-4 h-4 flex-shrink-0 text-soi-navy-400" />
                                                    {person.hospital}
                                                </p>
                                            )}

                                            {person.city && (
                                                <p className="inline-flex items-center gap-1.5 text-sm text-soi-navy-500">
                                                    <MapPin className="w-4 h-4 flex-shrink-0 text-soi-navy-400" />
                                                    {person.city}
                                                </p>
                                            )}

                                            {person.testimonial && (
                                                <div className="mt-2 pt-3 border-t border-gray-100">
                                                    <Quote className="w-4 h-4 text-soi-purple-300 mb-1" />
                                                    <p className="text-sm text-soi-navy-600 italic leading-relaxed">
                                                        {person.testimonial}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Empty state — shown until the first alumnus is published in Directus */
                        <div className="max-w-xl mx-auto text-center py-16">
                            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-soi-purple-100 flex items-center justify-center">
                                <Users className="w-8 h-8 text-soi-purple-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-soi-navy-800 mb-2">
                                Our Hall of Fame is coming soon
                            </h2>
                            <p className="text-soi-navy-600">
                                We&apos;re putting together the profiles of our distinguished alumni. Please check back shortly.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
