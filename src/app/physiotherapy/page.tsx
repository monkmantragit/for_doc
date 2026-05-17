import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Container } from '@/components/ui/container';
import PhysiotherapyBookingButton from '@/components/PhysiotherapyBookingButton';

export const metadata: Metadata = {
  title: 'Physiotherapy Services | Sports Orthopedic Institute, HSR',
  description: 'Comprehensive physiotherapy services for sports injuries, post-surgical rehabilitation, pain management, and more at Sports Orthopedic Institute, HSR.',
};

export default function PhysiotherapyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-28 pb-16 overflow-hidden">
          {/* Background image of physiotherapy in progress */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/uploads/content/3adb89cd-medium-shot-athlete-physiotherapy.webp.webp"
              alt="Physiotherapy session in progress"
              fill
              priority
              className="object-cover"
            />
            {/* Dark overlay + brand gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2E3A59]/85 via-[#2a3450]/80 to-[#1f2937]/85" />
          </div>

          <Container className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Physiotherapy Services at Sports Orthopedic Institute, HSR
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
                Bridging the gap between medical treatment and an active lifestyle with personalized recovery plans.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PhysiotherapyBookingButton
                  className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                  text="Book a Physiotherapy Session"
                />
                <a
                  href="#services"
                  className="inline-flex items-center px-6 py-3 border border-white/25 text-white text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  Explore Our Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* Introduction Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 mb-6">
                  Recovering from an injury or surgery is never just about healing tissues, it's about regaining strength, mobility, and the confidence to move freely again. That's where physiotherapy steps in. At Sports Orthopedic Institute, HSR, our physiotherapy services are designed to bridge the gap between medical treatment and an active lifestyle.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Instead of a one-size-fits-all approach, every recovery plan is personalized to your needs, whether you're an athlete aiming for peak performance, a working professional dealing with posture pain, or someone recovering from surgery.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Why Physiotherapy Matters Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Why Physiotherapy Matters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start mb-4">
                    <CheckCircle2 className="text-[#8B5C9E] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Post-surgical rehabilitation</h3>
                      <p className="text-gray-700">
                        Ensuring safe and effective recovery after joint replacement, ligament reconstruction, or arthroscopy.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start mb-4">
                    <CheckCircle2 className="text-[#8B5C9E] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Injury management</h3>
                      <p className="text-gray-700">
                        Helping athletes and active individuals recover from sprains, strains, and overuse injuries without rushing into surgery.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start mb-4">
                    <CheckCircle2 className="text-[#8B5C9E] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Chronic pain relief</h3>
                      <p className="text-gray-700">
                        Providing long-term solutions for back pain, neck pain, arthritis, and posture-related issues.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start mb-4">
                    <CheckCircle2 className="text-[#8B5C9E] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Preventive care</h3>
                      <p className="text-gray-700">
                        Reducing the risk of re-injury through strength, flexibility, and neuromuscular training.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Services Available at SOI, HSR
              </h2>
              <p className="text-lg text-gray-700 mb-10 text-center">
                At Sports Orthopedic Institute, physiotherapy is integrated with orthopedic expertise.
              </p>
              
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-[#8B5C9E] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                    Sports Injury Rehab
                  </h3>
                  <p className="text-gray-700 ml-11">
                    Tailored recovery programs for ACL tears, meniscus injuries, shoulder dislocations, ankle sprains, and other sports-related conditions.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-[#8B5C9E] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                    Post-operative Physiotherapy
                  </h3>
                  <p className="text-gray-700 ml-11">
                    Structured protocols for faster and safer return to function after surgeries like knee replacement, ligament reconstruction, or arthroscopic repairs.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-[#8B5C9E] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                    Pain & Mobility Management
                  </h3>
                  <p className="text-gray-700 ml-11">
                    Evidence-based manual therapy, electrotherapy (IFT, ultrasound, TENS), and exercise therapy for back, neck, and joint pain.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-[#8B5C9E] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
                    Strength & Conditioning
                  </h3>
                  <p className="text-gray-700 ml-11">
                    Functional training and progressive strengthening for athletes, fitness enthusiasts, and anyone looking to return to peak physical performance.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="bg-[#8B5C9E] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">5</span>
                    Neurological & Geriatric Rehab
                  </h3>
                  <p className="text-gray-700 ml-11">
                    Programs for stroke recovery, balance training, and improving mobility in elderly patients.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Integrated Advantage Section */}
        <section className="py-16 bg-[#8B5C9E]/10">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                The Integrated Advantage
              </h2>
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                <p className="text-lg text-gray-700 mb-6">
                  What makes physiotherapy at SOI unique is the team-based model. Orthopedic surgeons and physiotherapists work hand-in-hand ensuring that every patient receives not just temporary relief but long-term solutions.
                </p>
                <p className="text-lg text-gray-700 italic border-l-4 border-[#8B5C9E] pl-4">
                  "As I often remind my patients, surgery may fix the structure, but physiotherapy restores the function. And at Sports Orthopedic Institute, both come together seamlessly."
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-[#2E3A59] via-[#2a3450] to-[#1f2937]">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Ready to Start Your Recovery Journey?
              </h2>
              <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
                Our expert physiotherapists are here to help you regain strength, mobility, and confidence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PhysiotherapyBookingButton 
                  className="bg-white hover:bg-gray-100 text-[#8B5C9E] px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                  text="Book a Physiotherapy Session"
                />
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-white/25 text-white text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
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