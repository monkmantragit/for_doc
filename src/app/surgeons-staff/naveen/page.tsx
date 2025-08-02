import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowLeft, Award, BookOpen, Briefcase, GraduationCap, FileText, Globe, Users, Heart, Stethoscope, Medal, Phone } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import ExpandableBioSimple from '@/components/ExpandableBioSimple';
import ExpandableSection from '@/components/ExpandableSection';

export default function NaveenPage() {
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
                src="/images/naveen.jpg" 
                alt="Dr. Naveen Kumar L.V" 
                width={192} 
                height={192} 
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/4 md:pl-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-soi-navy-800 mb-2">Dr. Naveen Kumar L.V</h1>
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-soi-navy-100 text-soi-navy-800 mb-4 md:mb-0 md:mr-4">
                <Stethoscope className="w-4 h-4 mr-1" />
                Orthopedic Surgeon
              </span>
            </div>
            <p className="text-lg text-soi-navy-600 mt-2 italic">
              MBBS, MS Orth (India), FRCS Orth (Eng),<br/>
              MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy),<br/>
              FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland), FSEM (UK)
            </p>
            <div className="mt-6">
              <BookingButton className="px-6 py-3 bg-soi-navy-500 hover:bg-soi-navy-600 text-white rounded-lg shadow-md transition-colors border-2 border-soi-pink-400" />
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6">
          {/* Expertise Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Stethoscope className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Expertise</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Excellent Arthroscopy Surgeon</li>
                  <li>Ligament Reconstruction Surgeon</li>
                  <li>Muscle, Tendon Soft Tissue Surgery Expert</li>
                  <li>Stem Cell Therapy & Cartilage Regeneration Expert</li>
                  <li>Robotic Hip & Knee Replacement Surgeon (Mako Certified)</li>
                  <li>Shoulder Replacement Surgeon (Computer Navigated)</li>
                  <li>Well Experienced Pelvi-Acetabular Surgeon</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>

          {/* Professional Biography Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Professional Biography</h2>
            </div>
            <ExpandableBioSimple>
              <p className="text-soi-navy-700 leading-relaxed">
                Dr Naveen is the Prestigious John Charnley Gold Medalist, Wrightington Hospital, UK, Topper at dip SICOT, Italy and Best Trainee awardee – BIOS, UK. He achieved the distinction at FEBOT, Portugal and FRCS Orth I – England. He has achieved 10 qualifications to his credit so far! He has the highest number of qualifications among all the orthopedic surgeons in Karnataka and possibly India. He has completed several fellowships in UK and Germany in Arthroplasty and Arthroscopic surgeries. He has presented his papers on various podiums across the globe! His name and photographs have been etched on the Hall of Fame at <a href="https://www.wwl.nhs.uk/wrightington-hospital" target="_blank" rel="noopener noreferrer" className="text-soi-navy-600 hover:text-soi-pink-600 underline">Wrightington Hospital, Wrightington, Lancashire, UK</a> and also at <a href="https://www.med.uni-wuerzburg.de/en/orthopaedie/chair-of-orthopedic-and-orthopedic-clinic-koenig-ludwig-haus/" target="_blank" rel="noopener noreferrer" className="text-soi-navy-600 hover:text-soi-pink-600 underline">König-Ludwig-Haus Hospital, Würzburg, Germany</a>. With over 24 years of vast experience in the diverse fields of Shoulder, Knee & Ankle Arthroscopy, Hip & Knee Arthroplasty and Trauma, Dr Naveen has returned to his homeland to serve the people over here.
              </p>
              <p className="text-soi-navy-700 leading-relaxed mt-4">
                <span className="font-semibold text-soi-navy-800">Early Life & Education:</span><br/>
                Dr Naveen comes from a humble background. His father was a school teacher and mother a home-maker. He was born in Davangere and had his schooling from MKT Kirloskar School, Harihar. He then completed his Pre-University from MES College, Bangalore. He undertook his undergraduate studies from BLDEA's Medical College, Bijapur. He completed his MS Ortho from KMC, Mangalore, MAHE University. Further to this, the quest and hunger for knowledge and learning took him around the globe. He worked and trained in UK in several esteemed hospitals and institutions including Wrightington Hospital, Wigan, University Hospital, Cardiff, Withybush Hospital, Haverfordwest for over a period of 14 years. He was invited for several esteemed fellowships in Germany during his tenure in UK, which he completed.
              </p>
              <p className="text-soi-navy-700 leading-relaxed mt-4">
                <span className="font-semibold text-soi-navy-800">Career Progression:</span><br/>
                After returning to India in 2018, he did set up his consulting chambers in HSR Layout and Koramangala, Bangalore. In Jan 2023 he joined Manipal Hospital, Sarjapur Road as a Senior Consultant in Orthopaedics & Sports Injuries. In Jan 2025, he has been promoted as the Chief of Orthopaedics & Sports Medicine at Manipal Hospital.
              </p>
              <p className="text-soi-navy-700 leading-relaxed mt-4">
                <span className="font-semibold text-soi-navy-800">Current Practice & Charitable Work:</span><br/>
                Currently he has been seeing more than 80 patients per day in his specialty out patient clinics in HSR Layout as well as at Manipal Hospital. He has been performing thousands of complex surgeries such as arthroscopies of knees, shoulders and ankles with complex ligament reconstructions, knee replacements, hip replacements, revision knee replacements and revision hip surgeries. In addition, there is a lot of anonymous charity work which goes on parallelly without being avowed.
              </p>
            </ExpandableBioSimple>
          </div>

          {/* Awards & Distinction Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Awards & Distinction</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>"Service Excellence in Sports Injury Surgeries" – Vijay Karnataka & Bangalore Mirror Health Excellence Award – Jan 2025</li>
                  <li>Excellence in Sports Orthopedics & Regenerative Medicine – Dr. APJ Abdul Kalam Health Awards – July 2024</li>
                  <li>Best Presentation Award – British Indian Orthopaedic Society (BIOS) Conference, Cumbria, UK – July 2017</li>
                  <li>Wrightington Gold Medal, UK – May 2017</li>
                  <li>Prestigious German Fellowship award – Diploma SICOT, Italy – Sep 2016</li>
                  <li>Best Research Fellow presentation award – Wrightington Gold Medal Research day, UK – June 2016</li>
                  <li>2nd Price – State level Post-Graduate Orthopaedic Quiz, Mysore, India – Jul 2003</li>
                  <li>Honors – Ophthalmology, BLDEA's Medical College, Bijapur, India – Dec 1996</li>
                  <li>Sir John Charnley Award – Best Adult Pathology paper, NWOA, Manchester, UK – Co-author – Dec 2017</li>
                  <li>Best Poster award (Selected for) – BIOS Conference, UK – Co-author – July 2017</li>
                  <li>Gold medal – Wrightington Gold Medal Research day, UK – Co-author – June 2016</li>
                  <li>Distinction (90%) – FEBOT, Lisbon, Portugal – Oct 2017</li>
                  <li>Merit – MCh, Edgehill University, UK – August 2017</li>
                  <li>Distinction (77.5%) – FRCS Orth Part 1, UK – Nov 2016</li>
                  <li>Topper – Dip SICOT, Italy – Sep 2016</li>
                  <li>Merit – MSc, Salford University, UK – June 2016</li>
                  <li>Distinction, 3rd Rank – MBBS, 1st Phase – Karnataka University, India – Dec 1994</li>
                  <li>Distinction, 64th Rank – State level – SSLC Exams – Karnataka State, India – Apr 1991</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>

          {/* Qualifications Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Qualifications</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Dip FIFA – FIFA Medical, Switzerland – Oct 2019</li>
                  <li>FRCS Tr & Orth – Royal College of Surgeons, England – Nov 2017</li>
                  <li>FEBOT – European Board of Orthopaedics & Trauma, Lisbon, Portugal – Oct 2017</li>
                  <li>MCh Hip & Knee – Edgehill University, UK – July 2017</li>
                  <li>FSEM – UK – Oct 2017</li>
                  <li>Dip SICOT – Belgium – Sep 2016</li>
                  <li>MSc Orthopaedics – University of Salford, UK – Jun 2016</li>
                  <li>MRCS Part 2 – Royal College of Surgeons, England – Jul 2016</li>
                  <li>MRCS Part 1 – Royal College of Surgeons, England – Apr 2005</li>
                  <li>MS Orthopaedics – MAHE, Mangalore, India – Jun 2005</li>
                  <li>MBBS – BLDEA Medical College, Bijapur, India – Feb 2000</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>
          
          {/* Additional Credentials Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Medal className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Additional Credentials</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Certified Advanced Trauma Life Support (ATLS®) Provider accreditation – American College of Surgeons</li>
                  <li>Certified Advanced Life Support (ALS) Provider accreditation – Resuscitation Council (United Kingdom)</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>
          
          {/* Professional Visits Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Professional Visits</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Regrow Biosciences, Stem Cell research center and Factory, Mumbai – Jul 2023</li>
                  <li>Link implants Factory (Waldemar Link GmbH & Co), Hamburg, Germany – Jan 2018</li>
                  <li>Medartis Centre, Basel, Switzerland – Mar 2017</li>
                  <li>DePuy Synthes, Leeds, UK – Oct 2017</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>

          {/* Faculty Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Faculty & Guest Lectures</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Faculty – Panelist – IASCON, Bangalore – Sep 2024</li>
                  <li>Faculty – Chair-person – Live Surgery – IASCON, Bangalore – Sep 2024</li>
                  <li>Faculty – MIS Arthroplasty Symposium- Advanced Arthroplasty Conclave – Manipal Hospital – Bangalore – Oct 2024</li>
                  <li>Faculty – Knee Sports Symposium – Bengaluru Knee Course – Sri Jayadeva Hospital – Sept 2024</li>
                  <li>Faculty – The Knee Innovations Arthro-lab – Arthroscopy Knee – Arthrex – Bangalore – Aug 2024</li>
                  <li>Faculty – Meet the Masters – Shoulder Arthroscopy CME – DePuy Synthes – Bangalore – Jul 2024</li>
                  <li>Faculty – Bangalore Knee Conference – Bangalore – Dec 2023</li>
                  <li>Faculty – Shoulder Cadaveric Arthroscopy Course – Ramaiah Medical College, Bangalore – June 2023</li>
                  <li>Faculty – Bangalore Arthroscopy Course, Bangalore – Oct 2022</li>
                  <li>Faculty – AutoCart An Expert Insight into Cartilage Regeneration – International Arthrex Virtual Conference – Sep 2021</li>
                  <li>Faculty – Nishta 93 Multi Speciality CME – Mar 2020</li>
                  <li>Faculty – MCh / FRCS Preparation Course, Wrightington Hospital, UK – Jan 2018</li>
                  <li>Faculty – FRCS Viva Course, Orthopaedic Network, Sheffield, UK – Jan 2018</li>
                  <li>Klinikum Rechts Der Isar, Munich, Germany – Pelvic Discontinuity– Aug 2017</li>
                  <li>König – Ludwig – Haus, Würzburg, Germany – Peri-prosthetic fracture management – Aug 2017</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>

          {/* Conferences Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Conferences</h2>
            </div>
            <ExpandableSection>
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  <li>WIROC – 52nd annual conference – Bombay Orthopaedic Society, India – Dec 2017</li>
                  <li>British Indian Orthopaedic Society, Carlisle, UK – July 2017</li>
                  <li>EFORT Annual Congress, Vienna, Austria – June 2017</li>
                  <li>BHS – British Hip Society, London, UK – Mar 2017</li>
                  <li>SICOT Orthopaedic World Congress, Rome, Italy – Sep 2016</li>
                  <li>IOS UK Conference, Leicester, UK – July 2016</li>
                  <li>IOS UK Conference, Liverpool, UK – July 2015</li>
                  <li>IOACON – Indian Orthopaedic Association Conference – Dec 2003</li>
                </ul>
              </div>
            </ExpandableSection>
          </div>

          {/* Podium Presentations Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Podium Presentations</h2>
            </div>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-soi-navy-700 mt-2 mb-3">Primary Author</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>European Congress of Radiology, Vienna, Austria – "Trauma CT scans with pelvic compression devices in-situ: Helpful or Hindrance?" – March 2018</li>
                <li>North West Orthopaedic Association (NWOA) Research Day, Manchester, UK – Management of pelvic discontinuity in Revision Arthroplasty – Dec 2017</li>
                <li>North West Orthopaedic Association (NWOA) Research Day, Manchester, UK – Long term Outcomes of Total Hip Arthroplasty for failed femoral neck fracture osteosynthesis – Dec 2017</li>
                <li>British Indian Orthopaedic Society Conference, Cumbria, UK – "Total Hip Arthroplasty for Failed Osteosynthesis post Neck of Femur Fracture" – July 2017</li>
                <li>EFORT 18th Annual Congress, Vienna, Austria – "Outcomes of Total Hip Arthroplasty following Infectious Arthritis" – June 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Management of Pelvic Discontinuity in Revision Arthroplasty" – May 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Total Hip Arthroplasty for Failed Osteosynthesis post Neck of Femur Fracture" – May 2017</li>
                <li>British Hip Society, London, UK – "Primary Total Hip Replacement Following Infective Arthritis (Up to 41 Year Follow Up)" – Mar 2017</li>
                <li>Grand Round Presentation, Royal Albert Edward Infirmary, Wigan, UK – "A case of non-traumatic compartment syndrome" – Dec 2016</li>
                <li>SICOT Orthopaedic World Congress, Rome, Italy – "Missed Pelvic Fractures due to CT Scan in Pelvic Binders" – Sep 2016</li>
                <li>IOS UK Conference, Leicester, UK – "Outcomes of the Distal femoral replacement for salvage Knee revisions" –July 2016</li>
                <li>IOS UK Conference, Leicester, UK – "Outcomes of conservative management of primary patellar dislocation" –July 2016</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Total Hip Arthroplasty for Infectious Arthritis" – June 2016</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Short term outcomes of Hinged Knee Arthroplasty for complex revisions" –June 2016</li>
                <li>IOS UK Conference, Liverpool, UK – "Outcomes of C stem Asian hip replacement" – July 2015</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-soi-navy-700 mt-6 mb-3">Co-author</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>SICOT Orthopaedic World Congress, Cape Town, South Africa – "Long term outcome of knee arthroplasty in patients upto 40 years of age" – Dec 2018</li>
                <li>SICOT Orthopaedic World Congress, Cape Town, South Africa – "Proximal Femoral Replacement – A solution for profound femoral bone loss?" – Dec 2018</li>
                <li>North West Orthopaedic Association (NWOA) Research Day, Manchester, UK –Impaction Bone Grafting of Femur in Revision Hip Arthroplasty. Does length of stem matter? – Dec 2017</li>
                <li>British Indian Orthopaedic Society Conference, Cumbria, UK – – "Alpha-Defensin test in Prosthetic Hip and Knee Infection"– July 2017</li>
                <li>EFORT 18th Annual Congress, Vienna, Austria – "Impaction Bone Grafting Of Femur In Revision Hip Arthroplasty" – June 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Primary Knee Arthroplasty in Patients 40 years of age and younger" – May 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Alpha-Defensin test in Prosthetic Hip and Knee Infection" – May 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Outcomes of Dynamic Hip Screw Vs Multiple Cancellous Screws for Intra-capsular Fracture Neck of Femur in Young Patients" – May 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – "Proximal Femoral Replacement – A Viable Solution for Profound Femoral Bone Loss?" – May 2017</li>
                <li>SICOT Orthopaedic World Congress, Rome, Italy – "Femoral Impaction Bone Grafting in Revision Hip Arthroplasty: 5-19 years follow-up" – Sep 2016</li>
                <li>British Hip Society- Societa Italiana Dell'anca, Milan, Italy – "Metallic Augments with Cemented Sockets and Impaction Bone grafting in Acetabular Reconstruction" – Nov 2015</li>
              </ul>
            </div>
          </div>

          {/* Poster Presentations Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Poster Presentations</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>European Congress of Radiology, Vienna, Austria – "Trauma CT scans with pelvic compression devices in-situ: Helpful or Hindrance?" – March 2018</li>
                <li>British Indian Orthopaedic Society Conference, Cumbria, UK "Management of Pelvic Discontinuity in Revision Arthroplasty" – July 2017</li>
                <li>British Indian Orthopaedic Society Conference, Cumbria, UK – "Primary Knee Arthroplasty in Patients 40 years of age and younger"– (Co-author) – July 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – MRI Spine – How appropriate is our urgent referrals? – Co-author – May 2017</li>
                <li>Wrightington Gold Medal Research Day, Wrightington, UK – Perioperative Anticoagulation Bridging Therapy for Elective Hip/Knee Joint Arthroplasty – May 2017</li>
                <li>British Hip Society, London, UK – "Outcomes of Asian C-stem Primary Total Hip Arthroplasty in Femora with Abnormal Anatomy" – Mar 2017</li>
                <li>Wrightington Gold Medal Research Day Presentation, Wrightington, UK – "Missed Pelvic Fractures due to CT Scan in Pelvic Binders" – June 2016</li>
              </ul>
            </div>
          </div>

          {/* Courses Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Courses</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Depuy Synthes Advanced Shoulder Arthroscopy Cadaver Course – Bangkok, Thailand – Apr 2024</li>
                <li>Stryker Mako Total Hip Surgical Training Lab – Bangalore, India – Mar 2024</li>
                <li>Stryker Mako Total Knee Surgical Training Lab – Pune, India – Jul 2023</li>
                <li>Arthrex Technology Symposium – Delhi, India – Jun 2023</li>
                <li>Arthrex Technology Symposium – Dubai – Jun 2019</li>
                <li>Zimmer Hip Arthroplasty Workshop – Wiston, UK – Oct 2015</li>
                <li>Depuy Knee Implant Workshop – Leeds, April 2016</li>
                <li>Stryker Hoffman External Fixator Course – Wrightington, UK – Aug 2015</li>
                <li>Cemented Hip Arthroplasty Course – Wrightington, UK – Jun 2015</li>
                <li>Core Skills in Orthopaedic Surgery – Wrightington, UK – Mar 2015</li>
                <li>Advanced Life Support (ALS) Course – Edinburgh, Scotland – Apr 2015</li>
                <li>Mastering your risk workshop – Medical Protection Society, Manchester – Oct 2012</li>
                <li>Basic Surgical Skills (BSS) Course – Kings College Hospital, London – May 2005</li>
              </ul>
            </div>
          </div>

          {/* Continued Medical Education Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Continued Medical Education (CMEs)</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Clinical Negligence – Medical & Legal Issues – Wrightington, UK – May 2016</li>
                <li>Non-union Bone stimulation – Exogen Seminar – Wrightington, UK – Oct 2015</li>
                <li>22nd Mangalore Orthopaedic Course – Karnataka Orthopaedic Association, India – Apr 2004</li>
                <li>Paediatric Rheumatology – Kasturba Medical College, Mangalore, India – Mar 2004</li>
                <li>Orthopaedics – Kasturba Medical College, Manipal, India – Nov 2003</li>
                <li>CME – Karnataka Orthopaedic Association, India – Jan 2003</li>
                <li>SCORE – 2002 – Sri Ramachandra Medical College, Chennai, India – Nov 2002</li>
                <li>Hand injuries – Kerala Orthopaedic Association, India – Sep 2002</li>
              </ul>
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
                <li>K Syam, P Unnikrishnan, N Lokikere, A Gambhir, N Shah, M Porter, Proximal femoral replacement in non-neoplastic revision hip arthroplasty : five-year results, Bone & Joint Open 3(3):229-235, Mar 2022</li>
                <li>Amit Singh, N Lokikere, Akash A. Saraogi, N Unnikrishnan, James Davenport, Missed Lisfranc injuries-surgical vs conservative treatment. Irish Journal of Medical Science, 190(3), Sep 2020.</li>
                <li>N. Lokikere, A. Saraogi, U. Sonar, M. Porter, P. Kay, H. Wynn-Jones, N. Shah. Outcomes of distal femoral replacement for complex knee revisions with bone loss. Bone Joint J Jul 2016, 98-B (SUPP 14) 7.</li>
                <li>N. Lokikere, C. Jakaraddi, H. Wynn-Jones, N. Shah. Results of Asian C-stem in femora with abnormal anatomy. Bone Joint J Jun 2016, 98-B (SUPP 13) 3.</li>
                <li>U. Sonar, N. Lokikere, A. Kumar, B. Coupe, R. Gilbert. Outcomes of conservative management of primary patellar dislocation. Bone Joint J Jul 2016, 98-B (SUPP 14) 5.</li>
                <li>A. Saraogi, N. Lokikere, P. Siney, H. Nagai, B. Purbach, V. Raut, P. Kay. Femoral impaction bone grafting in revision hip arthroplasty: five- to 19-year follow-up. Bone Joint J Jul 2016, 98-B (SUPP 14) 10.</li>
                <li>A Saraogi, N Lokikere, V Raut. "Greater Trochanteric Pain Syndrome- A Review Article". EC Orthopaedics 4.1 (2016): 429-434.</li>
                <li>N. Lokikere, "Type II SLAP Tear of Shoulder – management options" – Critical review of the literature – Salford University, UK – Nov 2014.</li>
                <li>N. Lokikere, "Choice of the implant for Total hip replacement in a young patient with Diabetes mellitus" – Critical review of the literature – Salford University – Jan 2014.</li>
              </ul>
            </div>
          </div>

          {/* Executive & Management Experience Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Executive & Management Experience</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>SICOT India – Steering Committee Member – Sports Medicine – 2018 -19.</li>
                <li>SICOT India – Steering Committee Member – Exams & Alumni – 2018 -19.</li>
                <li>Spearheaded development of Orthopaedic pathways at Wigan Borough Care commissioning group (CCG), UK – 2014-15.</li>
                <li>Orthopaedic Lead for ULC group of Surgeries at Wigan, UK – 2010 – 2015</li>
                <li>Information Technology Lead and Prescribing lead for Wigan CCG, UK – 2012-2015.</li>
                <li>Chief PG coordinator – South Indian CME in Orthopaedics at Mangalore -2003 & 2004.</li>
                <li>Cultural Secretary of B.L.D.E.A Medical College, Bijapur during my MBBS training – Event management – intercollegiate level – 1997-98.</li>
              </ul>
            </div>
          </div>

          {/* Affiliations & Memberships Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6 border border-soi-pink-200">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-soi-pink-500 mr-3" />
              <h2 className="text-xl font-bold text-soi-navy-800">Affiliations & Memberships</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Karnataka Medical Council (KMC – India) – 51965</li>
                <li>General Medical Council (GMC – UK) – 6032305</li>
                <li>Indian Orthopaedic Association (IOA) – LM13639</li>
                <li>Indian Arthroscopy Society – LM-3504</li>
                <li>British Indian Orthopaedic Society – 2017/05/1012</li>
                <li>Société Internationale de Chirurgie Orthopédique et de Traumatologie (SICOT) – 26771</li>
                <li>Bangalore Orthopaedic Society – N43</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </main>
  );
}