import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowLeft, Award, BookOpen, Briefcase, GraduationCap, FileText, Globe, Users, Heart, Stethoscope, Medal, Phone } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import ExpandableBioSimple from '@/components/ExpandableBioSimple';

export default function SameerPage() {
  return (
    <main className="min-h-screen bg-tint-care">
      <SiteHeader theme="light" />
      
      <Container className="pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Link 
            href="/surgeons-staff" 
            className="inline-flex items-center text-soi-navy-600 hover:text-soi-pink-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </div>
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200 md:p-8 mb-10 border border-soi-pink-200">
          <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-soi-pink-200">
              <Image 
                src="/images/dr-sameer.webp" 
                alt="Dr. Sameer KM" 
                width={192} 
                height={192} 
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/4 md:pl-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-2">Dr. Sameer KM</h1>
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-soi-navy-100 text-soi-navy-800 mb-4 md:mb-0 md:mr-4">
                <Stethoscope className="w-4 h-4 mr-1" />
                Associate Consultant
              </span>
            </div>
            <p className="text-lg text-soi-navy-600 mt-2 italic">
              MBBS, MS(Ortho), DNB (Ortho),<br />
              Dip.FIFA(SM)(Switzerland), Dip SICOT(Belgium),<br />
              Fellowship in Arthroscopy & Arthroplasty (SOI)
            </p>
            <div className="mt-6">
              <BookingButton className="px-6 py-3 bg-soi-navy-500 hover:bg-soi-navy-600 text-white rounded-lg shadow-md transition-colors border-2 border-soi-pink-400" />
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6">
          {/* Professional Biography Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Professional Biography</h2>
            </div>
            <ExpandableBioSimple>
              <p className="text-soi-navy-700 leading-relaxed">
                Dr. Sameer KM is a highly skilled orthopedic surgeon with specialized training in Sports Medicine, Arthroscopy, and Joint Replacement procedures. After completing his MBBS and MS Orthopedics from prestigious institutions in India, he further enhanced his expertise by obtaining a Diploma in Football Medicine from FIFA and a Diploma from SICOT, Belgium.
              </p>
              <p className="text-soi-navy-700 leading-relaxed mt-4">
                <span className="font-semibold text-soi-navy-800">Experience & Training:</span><br/>
                Dr. Sameer has gained valuable experience working across various medical institutions in India, including Government Medical College, Thrissur, and Oxford Medical College, Bangalore. He completed his specialized Fellowship in Arthroscopy and Arthroplasty at Sports Orthopedics Institute under the guidance of Dr. Naveen Kumar L.V, where he honed his skills in advanced orthopedic techniques.
              </p>
              <p className="text-soi-navy-700 leading-relaxed mt-4">
                <span className="font-semibold text-soi-navy-800">Achievements & Current Role:</span><br/>
                Recognized for his academic excellence as the Best Outgoing Post Graduate student, Dr. Sameer has published multiple research papers in reputed medical journals. He brings his extensive knowledge in sports-related injuries, trauma management, and joint replacements to provide comprehensive orthopedic care. Currently serving as Associate Consultant at Sports Orthopedics Institute & Manipal Hospital, Dr. Sameer is committed to delivering high-quality patient care with his expertise in arthroscopic procedures and joint replacements.
              </p>
            </ExpandableBioSimple>
          </div>
          
          {/* Expertise Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Stethoscope className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Expertise</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Arthroscopy in Sports Orthopedic Medicine and Joint replacements</li>
                <li>M.S, DNB (Orthopedics) qualified doctor with one year of experience as Senior Resident.</li>
                <li>Handling OPD, Critical care & Trauma.</li>
                <li>UG and PG teaching experience.</li>
              </ul>
            </div>
          </div>
          
          {/* Rewards and Recognition Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Rewards and Recognition</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Best outgoing Post Graduate student.</li>
                <li>Academic Fellowship in Arthroscopy and Arthroplasty at Sports Orthopedic Institute, Bangalore under Dr. Naveen Kumar L V</li>
              </ul>
            </div>
          </div>

          {/* Professional Work Experience Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Professional Work Experience</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Associate Consultant – Sports Orthopedics Institute & Manipal Hospital – Mar 2024 to Till Date</li>
                <li>Fellowship – Arthroscopy & Arthroplasty – Sports Orthopedic Institute, Bangalore – Mar 2023 to Feb 2024.</li>
                <li>Senior Resident (Orthopedics) Oxford Medical College, Bangalore – Apr 2022 to Dec 2022.</li>
                <li>Senior Resident (Orthopedics) Govt. Medical College, Thrissur – Sep 2021 to Mar 2022.</li>
                <li>Junior Resident (Orthopedics) Govt Medical College, Thrissur – May 2018 to May 2021.</li>
                <li>House Surgeon- Bangalore Medical College And Research Institute – Mar 2016 to Mar 2017.</li>
              </ul>
            </div>
          </div>
          
          {/* Qualifications Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Qualifications</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Dip. SICOT – SICOT, Belgium – Sep 2024</li>
                <li>Dip. FIFA in Football Medicine – July 2023</li>
                <li>DNB Orthopedics: National Board of Examinations – 2022</li>
                <li>M.S. Orthopedic Surgery: Govt. Medical College Thrissur, KUHS, Kerala – 2021</li>
                <li>M.B.B.S: Bangalore Medical College and Research Institute, RGUHS, Karnataka – 2017</li>
              </ul>
            </div>
          </div>
          
          {/* Technical Skills Courses Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Technical Skills Courses</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>AO Basic Trauma Course, Vizag.</li>
                <li>AO Pediatric seminar, Coimbatore.</li>
                <li>Orthopedic Trauma Training Society, Ganga Hospital, Coimbatore.</li>
                <li>BLS / ACLS – Thrissur.</li>
                <li>Basic Trauma Course- St.James Hospital, Chalakudy.</li>
                <li>CME on Nerve And Tendon Repair – Thrissur.</li>
                <li>CME on Plastering Techniques And Bracing – Thrissur.</li>
                <li>CME on Neck Of Femur Fracture – Thrissur.</li>
                <li>Basic CME Degenerative Disc Disorders – Allapuzha.</li>
              </ul>
            </div>
          </div>
          
          {/* Research Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Research</h2>
            </div>
            <div className="prose max-w-none">
              <p>Submitted thesis titled "Functional And Radiological outcome of Medial Malleolar Fractures Treated by Open Reduction And Internal Fixation" to KUHS, Kerala as part of M.S. Orthopedics Degree.</p>
            </div>
          </div>
          
          {/* Publications Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Publications</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Irreducible Monteggia variant in a 11-year old boy treated by ulnar osteotomy (GMC, THRISSUR) , J. Evid. Based Med. Healthc., pISSN- 2349-2562, eISSN- 2349-2570/ Vol. 7/Issue 17/April 27, 2020.</li>
                <li>Limb salvage in Malignant Bone Tumors– A Prospective Follow Up Study Conducted at Government Medical College, Thrissur from 2017 to 2020 , J Evid Based Med Healthc, pISSN – 2349-2562, eISSN – 2349-2570 / Vol. 8 / Issue 28 / July 12, 2021.</li>
                <li>Evaluation of functional and radiological outcome of patients with medial malleolar fractures treated by open reduction and internal fixation at Government Medical college, Thrissur -A Prospective study during October 2019 to October 2020 , IJAR, Volume – 11 | Issue – 11 | November – 2021 | PRINT ISSN No. 2249 – 555X | DOI : 10.36106/ijar.</li>
              </ul>
            </div>
          </div>
          
          {/* Areas of Interest Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Heart className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Areas of Interest</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Sports Orthopedic Medicine</li>
                <li>Trauma</li>
                <li>Arthroscopy</li>
                <li>Arthroplasty</li>
              </ul>
            </div>
          </div>
          
          {/* Languages Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Languages</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>English: Fluent in both Spoken and Written.</li>
                <li>Hindi: Fluent in both Spoken and Written.</li>
                <li>Kannada: Fluent in Spoken and Written</li>
                <li>Malayalam: Fluent in Spoken.</li>
                <li>Tulu: Fluent in Spoken.</li>
              </ul>
            </div>
          </div>
          
          {/* Hobbies Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Heart className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Hobbies</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Sports, Games & Swimming.</li>
                <li>Travelling & Trekking.</li>
                <li>Internet browsing, watching good movies, listening music.</li>
                <li>Looking forward to being associated with NGOs.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </main>
  );
}