import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { faqContent } from "@/components/StaticPageComponents/config/faqContent";
import FAQSection from "@/components/FAQSection";
// import GridComponent from "@/components/StaticPageComponents/GridComponent";
// import ImageTextComponent from "@/components/StaticPageComponents/ImageTextComponent";
import TextBlockComponent from "@/components/TextBlockComponent";
import { StaticImageData } from "next/image";
import CallToAction from '@/components/CallToAction';
import Breadcrumbs from '@/components/Breadcrumbs';

// SOI Brand Colors - Medical Authority Theme
const brandColors = {
  primary: '#1e3a5f',    // SOI Navy - Medical Authority
  accent: '#8B5C9E',     // SOI Purple - Medical Expertise  
  text: '#1e3a5f',       // SOI Navy - Professional Text
  lightText: '#2a4d6b',  // SOI Navy 700 - Readable Content
  background: '#FFFFFF', // Clean White
  lightGray: '#f0f4f8',  // SOI Navy 50 - Light Background
};

// Metadata for the page
export const metadata = {
  title: "ACL Reconstruction and Meniscus Repair: The Ultimate Guide",
  description: "Discover everything about ACL reconstruction and meniscus repair, including surgery, recovery tips, rehab phases, costs, and return-to-sport timelines.",
  keywords: "ACL reconstruction, meniscus repair, knee surgery, sports injury, orthopedic surgeon Bangalore, Dr. Naveen Kumar",
  openGraph: {
    title: "ACL Reconstruction and Meniscus Repair: The Ultimate Guide",
    description: "Comprehensive guide to ACL surgery and meniscus repair by Dr. Naveen Kumar, expert orthopedic surgeon in Bangalore.",
    url: "/acl-reconstruction-and-meniscus-repair", // Relative path for current site
    type: "article",
    images: [
      {
        url: "https://73n.0c8.myftpupload.com/wp-content/uploads/2025/04/New-Project-2.jpg",
        width: 1920,
        height: 1080,
        alt: "ACL reconstruction and meniscus repair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ACL Reconstruction and Meniscus Repair: The Ultimate Guide",
    description: "Your complete resource for understanding ACL reconstruction and meniscus repair surgery, recovery, and rehabilitation.",
    images: ["https://73n.0c8.myftpupload.com/wp-content/uploads/2025/04/New-Project-2.jpg"]
  },
};

interface TextBlockItem {
  id: number;
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  listItems?: string[];
  orderedListItems?: string[];
  additionalParagraphs?: string[];
}

interface FAQItem {
  id?: string; // Added optional id for consistency with other FAQ structures
  question: string;
  answer: string[] | string; // Allow string for simpler answers if needed, or ensure it's always string[]
}

// Define breadcrumbs for navigation
const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "ACL Reconstruction and Meniscus Repair", href: "/acl-reconstruction-and-meniscus-repair" },
];

// Content data (previously separate, now for direct use)
const pageContentData = [
  {
    id: 1,
    title: "Introduction",
    subtitle: "Understanding the Knee Anatomy",
    paragraphs: [
      "Your knee is more than just a hinge. It's a powerful and intricate structure, built to withstand your body's weight while enabling movement like walking, jumping, and pivoting. Think of it as a complex machine made up of bones, ligaments, tendons, and cartilage—each part crucial for smooth motion.",
      "The knee consists of three main bones: the femur (thighbone), tibia (shinbone), and patella (kneecap). Supporting these bones are vital ligaments—the ACL (anterior cruciate ligament) being one of the most important. It controls forward motion and rotational stability. The meniscus, on the other hand, acts as the knee's shock absorber. It's a C-shaped piece of cartilage that cushions the bones and evenly distributes body weight.",
      "Without a healthy ACL and meniscus, your knee becomes unstable, painful, and at risk for long-term damage. That's why understanding these structures is key—especially if you're facing an injury and considering reconstruction or repair.",
    ],
  },
  {
    id: 2,
    subtitle: "What Are ACL and Meniscus Injuries?",
    paragraphs: [
      "ACL and meniscus injuries often go hand in hand, especially among athletes. The ACL is susceptible to tearing when a sudden change in direction, landing improperly from a jump, or direct impact occurs. Similarly, the meniscus can tear when twisted while bearing weight.",
      "An ACL tear is a complete or partial disruption of the ligament that leads to joint instability. Meanwhile, a meniscus tear can vary in severity—from minor fraying to a large tear that causes the knee to lock or give way. Both injuries not only limit movement but can also lead to chronic issues if left untreated.",
      "Together, an ACL reconstruction and meniscus repair procedure aim to restore knee stability, function, and durability. Whether you're a weekend warrior or a professional athlete, this surgery can be life-changing.",
    ],
  },
  {
    id: 3,
    title: "Causes and Risk Factors",
    subtitle: "Common Causes of ACL Tears",
    paragraphs: [
      "ACL tears don't just happen on the sports field. Yes, athletes are at higher risk, but everyday activities can also lead to injury. The most common causes include:",
    ],
    listItems: [
      "Sudden stops or changes in direction (think: cutting maneuvers in soccer or basketball)",
      "Improper landings from a jump",
      "Direct collision (like in football tackles)",
      "Overextension or twisting of the knee",
    ],
    additionalParagraphs: [
      "Interestingly, women are more prone to ACL injuries than men, largely due to differences in anatomy, hormones, and muscle control. Also, inadequate warm-ups, weak core muscles, and poor technique during high-intensity workouts or sports can increase your chances of injury.",
      "Once the ACL is torn, it rarely heals on its own due to limited blood supply. That's why surgical intervention is often the best route for full recovery.",
    ],
  },
  {
    id: 4,
    subtitle: "How Meniscus Injuries Occur",
    paragraphs: [
      "Meniscus tears are often caused by a sudden twist or turn of the knee while it's bent. Common scenarios include:",
    ],
    listItems: [
      "Pivoting or turning quickly",
      "Squatting down too deeply",
      "Lifting heavy objects with a bent knee",
      "Trauma from contact sports",
    ],
    additionalParagraphs: [
      "Degenerative tears, on the other hand, occur over time and are common in older adults. These are often due to wear and tear from years of use, sometimes with no obvious traumatic event. Regardless of how it happens, a torn meniscus can severely limit your knee's range of motion and comfort.",
      "In many ACL injuries, the meniscus also suffers damage, which makes dual repair necessary.",
    ],
  },
  {
    id: 5,
    subtitle: "Who Is at Higher Risk?",
    paragraphs: [
      "Not everyone is equally at risk for ACL and meniscus injuries. High-risk groups include:",
    ],
    listItems: [
      "Athletes in high-impact sports (soccer, football, basketball)",
      "People with a history of knee injuries",
      "Individuals with poor lower body mechanics",
      "Those with weak quadriceps and hamstrings",
      "Older adults with degenerative joint issues",
    ],
    additionalParagraphs: [
      "Your lifestyle, genetics, and activity level all play a part. Even how your foot strikes the ground while running or your knee alignment during squats can impact your injury risk.",
      "The good news? With awareness, strengthening exercises, and proper techniques, many of these injuries can be prevented.",
    ],
  },
  {
    id: 6,
    title: "Symptoms and Diagnosis",
    subtitle: "Recognizing the Signs of an ACL Tear",
    paragraphs: [
      "So, how do you know if you've torn your ACL? Most people report hearing a loud \"pop\" when it happens. It's often followed by:",
    ],
    listItems: [
      "Immediate swelling",
      "Sharp pain",
      "Instability when walking",
      "Loss of full range of motion",
      "A feeling of your knee \"giving out\"",
    ],
    additionalParagraphs: [
      "These symptoms are hard to ignore and usually prompt a trip to the doctor or ER. An ACL tear typically requires medical imaging and a physical exam to confirm.",
      "The Lachman test, pivot shift test, and anterior drawer test are commonly used by orthopedic specialists to detect instability in the knee caused by a torn ACL.",
    ],
  },
  {
    id: 7,
    subtitle: "Symptoms of a Meniscus Injury",
    paragraphs: [
      "Unlike the dramatic ACL tear, a meniscus injury can sometimes sneak up on you. Common signs include:",
    ],
    listItems: [
      "Pain, especially when twisting or rotating your knee",
      "Swelling and stiffness",
      "Difficulty bending or straightening your leg",
      "A feeling like your knee is \"locked\" or \"catching\"",
    ],
    additionalParagraphs: [
      "Some people can still walk with a meniscus tear, while others can't even straighten their leg. It all depends on the severity and location of the tear.",
    ],
  },
  {
    id: 8,
    subtitle: "Diagnostic Tests and Imaging",
    paragraphs: [
      "To get a clear picture, doctors often use:",
    ],
    listItems: [
      "X-rays: To rule out bone fractures.",
      "MRI (Magnetic Resonance Imaging): The gold standard for soft tissue evaluation.",
      "Ultrasound: Occasionally used to visualize joint effusion or meniscal displacement.",
    ],
    additionalParagraphs: [
      "In some cases, arthroscopy—a minimally invasive surgical procedure—may be used to diagnose and treat the injury in one go.",
    ],
  },
  {
    id: 9,
    title: "Treatment Options",
    subtitle: "Non-Surgical Treatment for Minor Injuries",
    paragraphs: [
      "Not every ACL or meniscus injury requires going under the knife. Some tears, especially small or partial ones, can be managed conservatively with:",
    ],
    listItems: [
      "RICE protocol (Rest, Ice, Compression, Elevation)",
      "Physical therapy",
      "Bracing",
      "Anti-inflammatory medications",
    ],
    additionalParagraphs: [
      "This approach is more effective for low-activity individuals or those with minor, stable tears. However, if your knee continues to give out or the tear affects your mobility long-term, surgery might be your best bet.",
    ],
  },
  {
    id: 10,
    title: "When Surgery Becomes Necessary",
    paragraphs: [
      "Surgery isn't always the first line of defense—but sometimes, it's the only way to truly restore your knee. So, when is surgery the best option?",
      "If you're an athlete or lead an active lifestyle, an ACL tear that doesn't heal properly can mean ongoing instability. This not only limits your movement but increases your risk of further injuries. Same goes for certain meniscus tears—especially large, complex, or \"bucket handle\" types that don't get better with time or therapy.",
      "You may need surgery if:",
    ],
    listItems: [
      "Your knee gives out during everyday activities",
      "You can't regain full range of motion",
      "Pain and swelling persist even after months of therapy",
      "You want to return to high-impact sports",
      "Imaging shows irreparable damage",
    ],
    additionalParagraphs: [
      "Ignoring a major ACL or meniscus tear can lead to chronic pain, arthritis, and even permanent disability. In many cases, a combined ACL reconstruction and meniscus repair offers the best long-term solution.",
    ],
  },
  {
    id: 11,
    subtitle: "Overview of ACL Reconstruction",
    paragraphs: [
      "ACL reconstruction is a surgical procedure that replaces the torn ligament with a new graft. This graft is usually harvested from one of the following:",
    ],
    listItems: [
      "Autograft: Tissue taken from your own body (usually hamstring, patellar, or quadriceps tendon)",
      "Allograft: Donor tissue from a cadaver",
      "Synthetic grafts: Rarely used but available in select cases",
    ],
    additionalParagraphs: [
      "The goal is to recreate the strength and functionality of the original ACL, so your knee feels and performs like new.",
      "This is usually done arthroscopically—meaning minimally invasive surgery through small incisions. The surgeon drills tunnels in the femur and tibia bones, threads the graft into place, and secures it using screws or fixation devices.",
      "Recovery isn't instant, but it's a game-changer for most patients who want their active lifestyle back.",
    ],
  },
  {
    id: 12,
    subtitle: "Understanding Meniscus Repair Techniques",
    paragraphs: [
      "When it comes to meniscus repair, the goal is to preserve as much of the natural cartilage as possible. The approach depends on the type and location of the tear. Common techniques include:",
    ],
    listItems: [
      "Inside-Out Repair: Sutures are passed from inside the joint to the outside through small incisions.",
      "Outside-In Repair: Sutures are passed from outside to inside.",
      "All-Inside Repair: Specialized devices allow the surgeon to place sutures entirely within the joint.",
    ],
    additionalParagraphs: [
      "Sometimes, if a tear is in a non-vascularized (poor blood supply) area or is too complex, a meniscectomy (partial removal of the meniscus) might be performed instead. However, repair is always preferred to maintain the knee's cushioning and shock absorption.",
    ],
  },
  {
    id: 13,
    title: "The Surgical Procedure",
    subtitle: "Pre-Operative Preparations",
    paragraphs: [
      "Before surgery, you'll undergo a thorough evaluation. This includes a physical exam, imaging reviews, and discussions about your medical history. You may also need to:",
    ],
    listItems: [
      "Stop certain medications (like blood thinners)",
      "Fast for a specific period",
      "Arrange for post-operative care and support",
      "Perform pre-hab exercises to strengthen the knee",
    ],
    additionalParagraphs: [
      "Good preparation helps ensure a smoother surgery and recovery.",
    ],
  },
  {
    id: 14,
    subtitle: "What to Expect During Surgery",
    paragraphs: [
      "ACL reconstruction and meniscus repair are typically performed under general or regional anesthesia. The surgery usually takes 2-3 hours.",
      "Through small arthroscopic incisions, the surgeon will:",
    ],
    orderedListItems: [
      "Inspect the joint and confirm the diagnosis.",
      "Prepare the graft (if using an autograft).",
      "Drill tunnels in the tibia and femur for ACL graft placement.",
      "Secure the ACL graft.",
      "Repair or trim the meniscus as needed using specialized instruments.",
      "Close the incisions.",
    ],
    additionalParagraphs: [
      "You'll wake up in a recovery room with your knee bandaged and possibly in a brace.",
    ],
  },
  {
    id: 15,
    subtitle: "Post-Operative Care and Immediate Recovery",
    paragraphs: [
      "Immediately after surgery, the focus is on managing pain and swelling. You'll receive pain medication and instructions on ice and elevation. Most patients go home the same day or after a one-night hospital stay.",
      "Key aspects of early recovery include:",
    ],
    listItems: [
      "Weight-bearing restrictions (often partial or non-weight bearing initially)",
      "Use of crutches",
      "Wearing a knee brace",
      "Gentle range-of-motion exercises as prescribed",
    ],
  },
  {
    id: 16,
    title: "Rehabilitation and Recovery Phases",
    subtitle: "Phase 1: Early Healing (0-2 Weeks)",
    paragraphs: [
      "Focus: Pain and swelling control, protecting the repair/graft, gentle range of motion.",
    ],
    listItems: [
      "Exercises: Ankle pumps, quad sets, heel slides, passive knee extension.",
      "Goals: Minimize swelling, achieve full knee extension, begin to activate quad muscles.",
    ],
  },
  {
    id: 17,
    subtitle: "Phase 2: Restoring Motion (2-6 Weeks)",
    paragraphs: [
      "Focus: Gradual increase in range of motion, light strengthening, weaning off crutches.",
    ],
    listItems: [
      "Exercises: Stationary cycling (low resistance), mini-squats, hamstring curls, calf raises.",
      "Goals: Achieve full flexion, normalize walking pattern, improve muscle control.",
    ],
  },
  {
    id: 18,
    subtitle: "Phase 3: Building Strength (6-12 Weeks)",
    paragraphs: [
      "Focus: Progressive strengthening, balance and proprioception training.",
    ],
    listItems: [
      "Exercises: Leg press, step-ups, single-leg balance, light plyometrics if cleared.",
      "Goals: Build strength comparable to the uninjured leg, improve balance.",
    ],
  },
  {
    id: 19,
    subtitle: "Phase 4: Advanced Strengthening & Sport-Specific Training (3-6 Months)",
    paragraphs: [
      "Focus: Continued strengthening, agility drills, sport-specific movements.",
    ],
    listItems: [
      "Exercises: Agility ladder, cone drills, jogging (if cleared), sport-specific practice.",
      "Goals: Prepare for return to sport, achieve good neuromuscular control.",
    ],
  },
  {
    id: 20,
    subtitle: "Phase 5: Return to Sport (6-12+ Months)",
    paragraphs: [
      "Focus: Gradual return to full sport participation after passing functional tests.",
    ],
    listItems: [
      "Activities: Full practice, scrimmage, and then game play.",
      "Goals: Confident and safe return to previous activity level, ongoing injury prevention.",
    ],
    additionalParagraphs: [
      "The timeline for each phase can vary significantly based on individual progress, graft type, and the extent of meniscus repair. Diligent adherence to your physiotherapy program is crucial.",
    ],
  },
  {
    id: 21,
    title: "Potential Risks and Complications",
    paragraphs: [
      "Like any surgery, ACL reconstruction and meniscus repair carry some risks, although serious complications are rare. These can include:",
    ],
    listItems: [
      "Infection",
      "Blood clots (DVT)",
      "Persistent pain or stiffness",
      "Nerve or blood vessel damage",
      "Graft failure or re-tear (more common if returning to sport too soon or with poor rehab)",
      "Hardware issues (screws/fixation devices)",
      "Numbness around incision sites",
      "Anesthesia-related complications",
    ],
    additionalParagraphs: [
      "Your surgeon will discuss these risks with you in detail. Following post-operative instructions carefully can minimize many of these risks.",
    ],
  },
  {
    id: 22,
    title: "Cost of ACL and Meniscus Surgery in Bangalore",
    subtitle: "Factors Influencing Cost",
    paragraphs: [
      "The cost of ACL reconstruction and meniscus repair in Bangalore can vary widely. Several factors influence the final bill:",
    ],
    listItems: [
      "Surgeon's fees and experience",
      "Hospital or surgical facility charges (OT, room rent, etc.)",
      "Type of anesthesia used",
      "Type of graft (autograft vs. allograft – allografts are generally more expensive)",
      "Complexity of the meniscus repair (if any)",
      "Implants and fixation devices used",
      "Duration of hospital stay",
      "Post-operative physiotherapy and rehabilitation costs",
      "Insurance coverage",
    ],
  },
  {
    id: 23,
    subtitle: "Average Cost Range",
    paragraphs: [
      "On average, the cost for a combined ACL reconstruction and meniscus repair surgery in Bangalore can range from ₹1,50,000 to ₹4,00,000 or more. This is an estimate and can change based on the factors above.",
      "It's important to get a detailed cost breakdown from your chosen hospital and surgeon. Discuss payment options and insurance pre-authorization well in advance.",
    ],
  },
  {
    id: 24,
    title: "Choosing the Right Surgeon and Hospital",
    subtitle: "Qualities of a Good Orthopedic Surgeon",
    paragraphs: [
      "Choosing your surgeon is one of the most critical decisions. Look for a surgeon who:",
    ],
    listItems: [
      "Is board-certified and has specialized fellowship training in sports medicine or arthroscopy.",
      "Has extensive experience performing ACL and meniscus surgeries.",
      "Has a good track record with positive patient outcomes.",
      "Communicates clearly and answers your questions patiently.",
      "Is associated with reputable hospitals with modern facilities.",
      "Emphasizes a comprehensive rehabilitation plan.",
    ],
  },
  {
    id: 25,
    subtitle: "What to Look for in a Hospital",
    paragraphs: [
      "The hospital or surgical center should have:",
    ],
    listItems: [
      "Advanced arthroscopic equipment and technology.",
      "A dedicated orthopedic department and experienced support staff.",
      "Good infection control protocols.",
      "Comprehensive post-operative care and physiotherapy services.",
      "Transparent billing and good patient support.",
    ],
  },
  {
    id: 26,
    title: "Life After Surgery",
    subtitle: "Long-Term Outcomes and Expectations",
    paragraphs: [
      "The majority of patients who undergo ACL reconstruction and meniscus repair experience significant improvement in knee stability and function, allowing them to return to their desired activities, including sports.",
      "Long-term success depends on several factors:",
    ],
    listItems: [
      "Adherence to the rehabilitation program.",
      "Type of graft used and surgical technique.",
      "Extent of initial injury (especially cartilage damage).",
      "Avoiding re-injury.",
      "Maintaining good overall fitness and knee strength.",
    ],
    additionalParagraphs: [
      "While the goal is to return to pre-injury levels, some athletes may need to modify their activities or take longer to regain peak performance. There is also a slightly increased risk of developing osteoarthritis in the injured knee later in life, even after successful surgery, but this risk is often lower than if the instability was left uncorrected.",
    ],
  },
  {
    id: 27,
    subtitle: "Tips for Preventing Re-Injury",
    paragraphs: [
      "Preventing another ACL or meniscus tear is crucial. Key strategies include:",
    ],
    listItems: [
      "Completing your full rehabilitation program and not rushing back to sports.",
      "Continuing with maintenance exercises to keep your knee strong and stable.",
      "Using proper technique during sports and activities.",
      "Adequate warm-up before exercise and cool-down afterwards.",
      "Wearing appropriate footwear.",
      "Listening to your body and not playing through pain or fatigue.",
      "Considering neuromuscular training programs that focus on agility, balance, and landing mechanics.",
    ],
  },
  {
    id: 28,
    title: "Conclusion",
    paragraphs: [
      "ACL reconstruction and meniscus repair can be a highly effective way to restore knee function, alleviate pain, and get you back to the activities you love. While the recovery journey requires commitment and patience, the long-term benefits are often life-changing.",
      "Choosing an experienced surgeon like Dr. Naveen Kumar, who specializes in these procedures, and committing to a thorough rehabilitation program are key to a successful outcome. If you're struggling with ACL or meniscus issues in Bangalore, don't hesitate to seek expert orthopedic care.",
    ],
  },
];

const pageFaqData: FAQItem[] = [
  {
    id: "faq1",
    question: "How long is the recovery after ACL and meniscus surgery?",
    answer: [
      "Full recovery and return to demanding sports can take 6-12 months, sometimes longer. The initial healing phase is about 6-8 weeks, followed by progressive rehabilitation. Adherence to physiotherapy is crucial for a timely and successful recovery.",
    ],
  },
  {
    id: "faq2",
    question: "Will I be able to play sports again after ACL reconstruction?",
    answer: [
      "Yes, the primary goal of ACL reconstruction is to enable patients to return to their pre-injury activity levels, including sports. Success rates are high, but it depends on diligent rehab, the type of sport, and individual factors. Most athletes return to sports within 9-12 months.",
    ],
  },
  {
    id: "faq3",
    question: "Is ACL surgery painful?",
    answer: [
      "You will experience post-operative pain, but it is managed with medications, ice, and elevation. The acute pain typically subsides within the first week or two. Pain during rehabilitation is usually manageable and related to muscle soreness from exercises.",
    ],
  },
  {
    id: "faq4",
    question: "What type of graft is best for ACL reconstruction?",
    answer: [
      "There's no single \"best\" graft for everyone. Common options include hamstring tendon, patellar tendon (both autografts from your own body), or an allograft (donor tissue). The choice depends on your age, activity level, surgeon's preference, and specific injury. Dr. Naveen Kumar will discuss the pros and cons of each option with you.",
    ],
  },
  {
    id: "faq5",
    question: "Can a torn meniscus heal on its own?",
    answer: [
      "Some small tears in the outer part of the meniscus (the \"red zone\" with good blood supply) may heal on their own or with conservative treatment. However, larger or more complex tears, especially in the inner \"white zone\" (poor blood supply), often require surgical repair or trimming.",
    ],
  },
  {
    id: "faq6",
    question: "When can I start walking after ACL and meniscus surgery?",
    answer: [
      "This varies. You'll likely use crutches for a few weeks. Partial weight-bearing might start soon after surgery, progressing to full weight-bearing as tolerated and as guided by your surgeon and physical therapist. For meniscus repairs, weight-bearing restrictions might be stricter to protect the repair.",
    ],
  },
  {
    id: "faq7",
    question: "What are the success rates for ACL reconstruction?",
    answer: [
      "Success rates for ACL reconstruction are generally very high, often reported in the range of 85-95% in terms of restoring knee stability and patient satisfaction. Graft re-tear rates are relatively low but can be influenced by adherence to rehab and activity levels.",
    ],
  },
  {
    id: "faq8",
    question: "How do I prepare for ACL surgery?",
    answer: [
      "Pre-operative preparation (\"pre-hab\") is important. This may include exercises to reduce swelling, improve range of motion, and strengthen the muscles around the knee. You'll also need to arrange for time off work/school and post-operative support at home.",
    ],
  },
  {
    id: "faq9",
    question: "What is the difference between meniscus repair and meniscectomy?",
    answer: [
      "Meniscus repair involves suturing the torn pieces of the meniscus back together to allow them to heal. A meniscectomy involves removing the damaged portion of the meniscus. Repair is generally preferred when possible, as it preserves the meniscus and its cushioning function, potentially reducing the long-term risk of arthritis.",
    ],
  },
  {
    id: "faq10",
    question: "Is physiotherapy necessary after surgery?",
    answer: [
      "Absolutely. Physiotherapy is a critical component of recovery after ACL and meniscus surgery. A structured, progressive rehabilitation program is essential to regain range of motion, strength, balance, and eventually return to full activity safely.",
    ],
  },
];

const ACLReconstructionAndMeniscusRepairPage = () => {
  const faqs: FAQItem[] = pageFaqData.map(faq => ({
    ...faq,
    question: faq.question.replace(/\\'/g, "'"),
    answer: Array.isArray(faq.answer) 
            ? faq.answer.map(a => a.replace(/\\'/g, "'")) 
            : faq.answer.replace(/\\'/g, "'"),
  }));

  const renderTextBlockItem = (item: typeof pageContentData[0]) => {
    // Helper to clean apostrophes for all string content
    const clean = (text: string) => text.replace(/\\'/g, "'");

    return (
      <section key={item.id} className="mb-8 sm:mb-12 md:mb-16">
        {item.title && (
          <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
            {clean(item.title)}
          </h2>
        )}
        {item.subtitle && (
          <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4" style={{ color: brandColors.primary }}>
            {clean(item.subtitle)}
          </h3>
        )}
        {item.paragraphs && item.paragraphs.map((p, index) => (
          <p key={`para-${item.id}-${index}`} className="mb-4 leading-relaxed" style={{ color: brandColors.lightText }}>
            {clean(p)}
          </p>
        ))}
        {item.listItems && (
          <ul className="list-disc pl-6 mb-4 space-y-2">
            {item.listItems.map((li, index) => (
              <li key={`listitem-${item.id}-${index}`} style={{ color: brandColors.lightText }}>{clean(li)}</li>
            ))}
          </ul>
        )}
        {item.orderedListItems && (
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            {item.orderedListItems.map((li, index) => (
              <li key={`orderedlistitem-${item.id}-${index}`} style={{ color: brandColors.lightText }}>{clean(li)}</li>
            ))}
          </ol>
        )}
        {item.additionalParagraphs && item.additionalParagraphs.map((p, index) => (
          <p key={`addpara-${item.id}-${index}`} className="mt-4 leading-relaxed" style={{ color: brandColors.lightText }}>
            {clean(p)}
          </p>
        ))}
      </section>
    );
  };

  return (
    <>
      <SiteHeader />
      {/* Breadcrumbs can be rendered here if desired */}
      {/* <Breadcrumbs items={breadcrumbsData} /> */}

      <main className="container mx-auto px-4 py-8 sm:py-12 bg-tint-authority" style={{ color: brandColors.text }}>
        
        {/* Hero Image */}
        <div className="mb-8 sm:mb-12 md:mb-16 relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg border border-soi-navy-200">
          <Image 
            src="https://73n.0c8.myftpupload.com/wp-content/uploads/2025/04/New-Project-2.jpg" 
            alt="ACL reconstruction and meniscus repair" 
            fill
            style={{ objectFit: 'cover' }}
            priority 
          />
        </div>

        <article className="prose lg:prose-xl max-w-none mx-auto">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center" style={{ color: brandColors.primary }}>
            {metadata.title.replace(/\\'/g, "'")}
          </h1>

          {pageContentData.map(item => renderTextBlockItem(item))}

        </article>

        {/* FAQ Section - using the standard accordion approach */}
        {faqs && faqs.length > 0 && (
          <section className="mt-12 sm:mt-16 py-8 bg-white border border-soi-navy-200 rounded-lg">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center" style={{ color: brandColors.primary }}>
                Frequently Asked Questions
              </h2>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${faq.id || index + 1}`} key={faq.id || index} className="border rounded-md" style={{ borderColor: brandColors.accent + '30' }}>
                      <AccordionTrigger className="p-4 sm:p-5 text-left font-medium hover:no-underline" style={{ color: brandColors.primary }}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 sm:p-5 pt-0">
                        {Array.isArray(faq.answer) ? (
                          faq.answer.map((p, i) => (
                            <p key={i} className="text-base leading-relaxed mb-2" style={{ color: brandColors.lightText }}>{p}</p>
                          ))
                        ) : (
                          <p className="text-base leading-relaxed" style={{ color: brandColors.lightText }}>{faq.answer}</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}
        
        {/* CallToAction can be here if it's generic and used */}
        {/* <CallToAction 
          title="Ready to Discuss Your Knee Health?"
          description="Book a consultation with Dr. Naveen Kumar, Bangalore's leading orthopedic surgeon, to explore your ACL and Meniscus treatment options."
          buttonText="Book Appointment"
          buttonLink="/contact" // Or the correct appointment link
          // Pass brandColors to CallToAction if it uses them
        /> */}

      </main>
      <SiteFooter />
    </>
  );
};

export default ACLReconstructionAndMeniscusRepairPage;