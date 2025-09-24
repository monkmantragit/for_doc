import React from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Metadata } from 'next';

// Generate metadata for the page
export const metadata: Metadata = {
  title: 'Beyond the Knife: Empowering Your Recovery with Physiotherapy',
  description: 'Discover how physiotherapy at Sports Orthopedics Institute serves as the crucial bridge between healing and thriving after injury or surgery.',
  openGraph: {
    title: 'Beyond the Knife: Empowering Your Recovery with Physiotherapy',
    description: 'Discover how physiotherapy at Sports Orthopedics Institute serves as the crucial bridge between healing and thriving after injury or surgery.',
    images: ['/images/default-blog.jpg'],
  },
};

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Social share component
const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://staged-doc.up.railway.app';
  const encodedUrl = encodeURIComponent(`${baseUrl}${url}`);
  const encodedTitle = encodeURIComponent(title);
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500 text-sm font-medium mr-2">Share:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Facebook"
      >
        <span className="sr-only">Facebook</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Twitter"
      >
        <span className="sr-only">Twitter</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on LinkedIn"
      >
        <span className="sr-only">LinkedIn</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="p-2 text-gray-600 hover:text-[#8B5C9E] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share via Email"
      >
        <span className="sr-only">Email</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </a>
    </div>
  );
};

// Main blog post page component
export default function PhysiotherapyBlogPost() {
  const post = {
    title: "Beyond the Knife: Empowering Your Recovery and Performance with Physiotherapy at Sports Orthopedics Institute",
    author: "Dr. Atharva Mishra PT",
    date_created: "2023-09-15",
    reading_time: 8,
    category: "Rehabilitation",
    featured_image_url: "/images_bone_joint/sportsman-having-knee-injury-problem.webp",
    slug: "/blogs/physiotherapy-recovery"
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            priority
            className="object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
        <div className="container mx-auto px-4 relative z-20 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-[#8B5C9E]/90 text-white text-sm font-medium mb-6">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl text-white font-bold leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-sm space-x-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(post.date_created)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{post.reading_time} min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link 
                href="/blogs" 
                className="inline-flex items-center text-[#8B5C9E] hover:text-[#7a4f8a] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to all posts
              </Link>
              <SocialShare url={post.slug} title={post.title} />
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl font-medium text-gray-700 mb-6">
                By {post.author}
              </p>
              
              <p>
                As a physiotherapist at the Sports Orthopedics Institute, I often have the privilege of witnessing incredible transformations. Patients arrive, sometimes post-surgery, sometimes battling chronic pain, or even seeking to enhance their athletic performance. My role, and the role of our entire physiotherapy team, is to guide them on a journey back to optimal function, movement, and strength often far beyond what they thought possible.
              </p>
              
              <p>
                While our esteemed orthopedic surgeon like Dr. Naveen Kumar is expert in repairing and reconstructing, I firmly believe that physiotherapy is the crucial bridge between healing and truly thriving. We don't just treat the injury; we treat the whole person, understanding how every movement, every muscle, and every joint contributes to your overall well-being and performance.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6">
                Why is Physiotherapy the Cornerstone of Your Recovery?
              </h2>
              
              <p>
                Think of your body as a finely tuned machine. When a part breaks or undergoes repair, simply fixing it isn't enough. It needs calibration, strengthening, and proper training to function flawlessly again. That's precisely what physiotherapy provides.
              </p>
              
              <p>
                At the Sports Orthopedics Institute, our integrated approach means we work seamlessly with your surgeon. We understand the intricacies of your diagnosis and surgical procedure, allowing us to craft a personalized rehabilitation plan that respects your body's healing timeline while pushing you safely towards your goals.
              </p>
              
              <p>
                Our highly skilled team focuses on a multifaceted approach to rehabilitation, including:
              </p>
              
              <ol className="list-decimal pl-6 space-y-4 my-6">
                <li>
                  <strong>Pain Management & Swelling Reduction:</strong> Utilizing manual therapies, modalities, and targeted exercises to alleviate discomfort and reduce inflammation, creating an optimal healing environment.
                </li>
                <li>
                  <strong>Restoring Range of Motion (ROM):</strong> Gently and progressively working to regain full flexibility in joints that may have become stiff due to injury, surgery, or disuse.
                </li>
                <li>
                  <strong>Strength & Endurance Training:</strong> Designing individualized exercise programs to rebuild weakened muscles, improve stability around joints, and enhance overall physical resilience.
                </li>
                <li>
                  <strong>Proprioception & Balance Retraining:</strong> Re-educating your body's awareness in space, crucial for preventing re-injury and improving agility, especially for athletes.
                </li>
                <li>
                  <strong>Gait & Movement Pattern Correction:</strong> Analyzing how you move and identifying any compensatory patterns that could be causing pain or increasing injury risk, then teaching you more efficient and safer ways to move.
                </li>
                <li>
                  <strong>Sport-Specific & Functional Rehabilitation:</strong> This is where we excel! We tailor exercises to mimic the demands of your sport or daily activities, ensuring a safe and confident return to your desired level of function.
                </li>
                <li>
                  <strong>Patient Education & Injury Prevention:</strong> Empowering you with the knowledge and tools to understand your condition, manage your recovery, and implement strategies to prevent future injuries.
                </li>
              </ol>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6">
                Our Comprehensive Physiotherapy Offerings At the Sports Orthopedics Institute
              </h2>
              
              <p>
                We are equipped to address a wide array of conditions and recovery stages with state-of-the-art techniques and compassionate care.
              </p>
              
              <p>
                <strong>Post-Surgical Rehabilitation:</strong> Following procedures like ACL reconstruction, meniscus repair, rotator cuff surgery, joint replacements, or fracture care, our structured protocols guide you through every phase, from initial protection to advanced plyometrics and agility drills. We ensure you meet key milestones safely and effectively.
              </p>
              
              <div className="bg-[#f8f5fb] p-6 rounded-lg my-8 border-l-4 border-[#8B5C9E]">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Start Your Recovery Journey?</h3>
                <p className="mb-4">Our expert physiotherapy team is ready to help you recover, rebuild, and return to your best performance.</p>
                <Link 
                  href="/book-appointment" 
                  className="inline-block px-6 py-3 bg-[#8B5C9E] text-white font-medium rounded-lg hover:bg-[#7a4f8a] transition-colors"
                >
                  Book a Physiotherapy Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}