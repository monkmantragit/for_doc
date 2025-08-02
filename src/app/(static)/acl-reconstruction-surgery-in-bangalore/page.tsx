import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  title: 'ACL Reconstruction Surgery Doctor in Bangalore| Sports Ortho',
  description: 'Get expert ACL reconstruction surgery in Bangalore with top sports ortho specialists. Restore mobility and recover faster with advanced treatment options.',
};

const ACLReconstructionPage = () => {
  // SOI Brand Colors - Medical Authority Theme
  const brandColors = {
    primary: '#1e3a5f',    // SOI Navy - Medical Authority
    accent: '#8B5C9E',     // SOI Purple - Medical Expertise
    text: '#1e3a5f',       // SOI Navy - Professional Text
    lightText: '#2a4d6b',  // SOI Navy 700 - Readable Content
    background: '#FFFFFF', // Clean White
    lightGray: '#f0f4f8',  // SOI Navy 50 - Light Background
    success: '#a8c4a2',    // SOI Mint - Success States
    warning: '#d4a5b8',    // SOI Pink - Care/Warning
  };

  const faqData = [
    {
      question: "How long does ACL reconstruction surgery take?",
      answer: "ACL reconstruction surgery typically takes 1 to 1.5 hours. The duration may vary depending on the complexity of the case and whether additional procedures (like meniscus repair) are needed."
    },
    {
      question: "What is the success rate of ACL reconstruction?",
      answer: "ACL reconstruction has a high success rate, typically 85-95% for returning to pre-injury activity levels. Success depends on factors like graft choice, surgical technique, and adherence to rehabilitation."
    },
    {
      question: "When can I return to sports after ACL surgery?",
      answer: "Most patients can return to sports 6-9 months after ACL reconstruction, depending on the sport and individual recovery progress. Dr. Naveen will assess your readiness through functional tests and strength evaluations."
    },
    {
      question: "What type of graft is best for my ACL reconstruction?",
      answer: "The best graft depends on your age, activity level, and personal factors. Dr. Naveen will discuss options including hamstring tendon, patellar tendon, quadriceps tendon, or allograft to determine what's optimal for your situation."
    },
    {
      question: "Is ACL reconstruction surgery painful?",
      answer: "Modern arthroscopic techniques and pain management protocols minimize discomfort. Most patients experience manageable pain that improves significantly within the first week after surgery."
    }
  ];

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 sm:py-12 bg-tint-authority" style={{ color: brandColors.text }}>
        <article className="prose lg:prose-xl max-w-none">
          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center" style={{ color: brandColors.primary }}>
            ACL Reconstruction Surgery Doctor in Bangalore
          </h1>

          {/* Introduction Section */}
          <section className="mb-10 sm:mb-12">
            <p className="mb-4 sm:mb-6 leading-relaxed italic" style={{ color: brandColors.lightText }}>
              Regain your knee stability and return to an active lifestyle with expert ACL reconstruction in Bangalore. Dr. Naveen Kumar L.V – a renowned sports orthopedic surgeon in HSR Layout – provides advanced <strong>ACL tear surgery</strong> and personalized care to get you back on your feet. <strong className="not-italic">Call us today to schedule your appointment and take the first step toward recovery.</strong>
            </p>

            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              Introduction to ACL Reconstruction and Its Importance
            </h2>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              A torn ACL (anterior cruciate ligament) is a common knee injury that can sideline you from sports and even make everyday activities difficult. The ACL is a key <strong>knee ligament</strong> that stabilizes your knee during pivoting and sudden movements. When it's torn (often during sports like football, basketball, or accidents), the knee can buckle or feel unstable. This not only impairs your performance but can also lead to further damage (like meniscus tears or early arthritis) if left untreated.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>ACL reconstruction surgery</strong> is a specialized <strong>knee ligament surgery</strong> designed to restore stability to an ACL-deficient knee. This procedure replaces the damaged ACL with a new tissue graft, effectively creating a new ligament. This surgery is often crucial for athletes and active individuals who want to return to sports and anyone experiencing knee instability in daily life. By reconstructing the ACL, patients can regain confidence in their knee, prevent recurrent injuries, and protect the joint's long-term health.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              If you're in Bangalore (Koramangala, BTM Layout, <strong>HSR Layout</strong>, or surrounding areas) and suffering from an ACL injury, know that help is available. Our <strong>sports injury specialist</strong>, Dr. Naveen, will guide you through the journey—from initial assessment to full recovery—so you can get back to the activities you love with a strong and stable knee.
            </p>
          </section>

          {/* Why Choose Dr. Naveen Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              Why Choose Dr. Naveen for ACL Reconstruction in Bangalore?
            </h2>
            <p className="mb-6 sm:mb-8 leading-relaxed" style={{ color: brandColors.lightText }}>
              Choosing the right doctor for your ACL reconstruction is the most important step toward a successful outcome. Dr. Naveen Kumar L.V. is widely regarded as one of the <strong>best orthopedic surgeons in Bangalore</strong> for knee injuries and sports medicine. Here's why patients trust Sports Orthopedics for their ACL surgery:
            </p>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-la-hourglass-start-solid */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>Extensive Experience</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Dr. Naveen has over 24 years of experience in orthopedics and has performed hundreds of ACL reconstructions.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-la-running-solid */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>Sports Injury Specialist</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  With international qualifications (FRCS Orth, MCh, Dip. Sports Medicine) and training in sports medicine, he specializes in treating athletes and active individuals.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-fab-connectdevelop */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>Advanced Surgical Techniques</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Dr. Naveen stays up-to-date with the latest surgical techniques for ACL reconstruction.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-far-check-square-o */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>High Success Rates & Testimonials</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  His patients consistently achieve excellent outcomes, regaining stability and returning to sports or daily activities.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-la-hand-holding-heart-solid */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>Personalized Care</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Every patient's injury and goals are unique. Sports Orthopedics provides one-on-one attention — from thorough diagnosis and clear explanation of treatment options.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-la-search-location-solid */}
                <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: brandColors.primary }}>Convenient Location</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  <strong>Sports Orthopedics</strong>, is located in HSR Layout, Bangalore, This location is easily accessible for patients from <strong>Koramangala, BTM Layout, Bellandur, Sarjapur Road, </strong>and other parts of Bangalore.
                </p>
              </div>
            </div>
          </section>

          {/* ACL Techniques and Graft Options Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              ACL Reconstruction Techniques and Graft Options
            </h2>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              ACL reconstruction is not a one-size-fits-all procedure. Dr. Naveen employs various techniques and graft types based on what's best for each patient. Two key aspects define an ACL surgery: <strong>the graft choice</strong> (what tissue is used to create the new ligament) and <strong>the surgical technique</strong> (how the graft is placed and fixed in the knee). Below, we break down the options and advanced techniques used in ACL surgeries:
            </p>

            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              Graft Options for ACL Reconstruction
            </h3>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              The "graft" is the tissue that will become your new ACL. We will help you choose the ideal graft depending on your age, activity level, and preferences. Common ACL graft choices include:
            </p>
            <ul className="list-disc pl-6 mb-6 sm:mb-8 space-y-3 sm:space-y-4" style={{ color: brandColors.lightText }}>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Hamstring Tendon Autograft:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>This is one of the most popular grafts. It uses two of your own hamstring tendons (taken from the back of your thigh). Hamstring grafts allow strong ligament reconstruction with relatively small incisions. Patients often have less front-knee pain compared to other grafts, and the strength of a well-prepared hamstring graft is excellent for returning to sports.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Patellar Tendon Autograft (Bone-Patellar Tendon-Bone):</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>This technique uses the middle third of your own patellar tendon (just below the kneecap), along with small pieces of bone attached at each end. It has been a "gold standard" for athletes because the bone-to-bone healing can make the graft very secure. Patellar tendon grafts are extremely strong and have a high success rate for athletes in high-demand sports. The trade-off is that some patients might experience temporary pain in the front of the knee or discomfort when kneeling during recovery.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Quadriceps Tendon Autograft:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>The quadriceps tendon (above the kneecap) is another autograft option, sometimes taken with a small piece of bone. It provides a thick, robust graft—useful in patients who need a larger graft or in revision (repeat) ACL surgeries. Dr. Naveen might choose a quad tendon graft if you have had a previous ACL surgery or if your build and activity needs suggest this as a better option. Many patients tolerate this graft well with low risk of long-term pain.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Allograft (Donor Tissue):</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>In some cases, an allograft (a tendon from a donor/cadaver) may be used. The benefit is that it avoids taking your own tissue, so your own muscles and tendons remain untouched. This can mean a shorter initial surgery and less post-operative discomfort at the harvest site. However, allografts generally take longer to fully incorporate and heal into the bone, and they might have a slightly higher failure rate in young athletic individuals. Dr. Naveen typically reserves allografts for specific situations – such as certain revision surgeries or for older, less active patients – and only uses allograft from highly screened sources to ensure safety.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Synthetic Ligament Grafts:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>Newer artificial ligament materials (synthetic grafts) have been developed to replace the ACL. While not common, they may be an option in select cases or clinical trials. Synthetic grafts (like the LARS ligament) can offer the advantage of immediate strength and quicker surgery, but historically some have had issues with long-term failure. Dr. Naveen will discuss if a synthetic graft is appropriate or if sticking to biological tissue is the better choice for you (in most cases, your own tissue or a donor tissue is preferred for best healing).</p>
              </li>
            </ul>

            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              Advanced Surgical Techniques
            </h3>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              In all ACL reconstructions performed by Sports Orthopedics, <strong><Link href="/procedure-surgery/arthroscopy-knee/" className="font-medium hover:underline" style={{ color: brandColors.accent }}>arthroscopic surgery</Link></strong> is the standard. This means the procedure is done through small keyhole incisions using a camera (arthroscope) and specialized instruments, rather than a large open incision. Arthroscopy leads to less pain, minimal scarring, and faster recovery. Within the realm of arthroscopic ACL surgery, there are a few advanced techniques and innovations that Dr. Naveen utilizes:
            </p>
            <ul className="list-disc pl-6 mb-6 sm:mb-8 space-y-3 sm:space-y-4" style={{ color: brandColors.lightText }}>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Anatomic ACL Reconstruction:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>This isn't a specific "technique" but a principle Dr. Naveen follows. It means the new ACL is placed in the exact original anatomic position of your natural ACL. By drilling tunnels in the correct anatomical spots on the femur (thigh bone) and tibia (shin bone), the reconstructed ligament can restore more natural knee mechanics. This leads to better stability, especially for pivoting movements, and reduces the risk of re-injury.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>All-Inside ACL Reconstruction:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>In a traditional ACL surgery, one end of the graft is often fixed with a screw inside the bone. In an all-inside technique, special sockets (rather than full tunnels) are created in the bones, and the graft is anchored with small, strong buttons on both the femur and tibia. The all-inside approach uses even smaller bone openings and can preserve more bone stock. It often results in less post-op pain at the bone sites and can allow the surgeon to double-loop the hamstring graft to make it thicker. Dr. Naveen may use the all-inside method to maximize graft strength while minimizing tissue trauma, depending on the case.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Double-Bundle ACL Reconstruction:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>The ACL has two functional bundles of fibers (anteromedial and posterolateral). In certain patients (like high-level athletes or if anatomy calls for it), Dr. Naveen can perform a double-bundle ACL reconstruction, which uses two separate smaller grafts to recreate both bundles of the ACL. The goal is to mimic the knee's natural anatomy more closely, potentially giving improved rotational stability. This is a more complex technique and not necessary for every patient, but Dr. Naveen is experienced in it for cases that warrant a double-bundle approach.</p>
              </li>
              <li>
                <h4 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: brandColors.primary }}>Internal Brace Augmentation:</h4>
                <p className="leading-relaxed" style={{ color: brandColors.lightText }}>For additional support, especially in high-demand athletes or in repair of certain acute ACL tears, Dr. Naveen may use an internal brace. The internal brace is a strong synthetic fiber tape that is implanted alongside the new ACL graft. Think of it as a reinforcement – it helps protect and stabilize the healing graft during the first few critical months. <strong>Important:</strong> The internal brace is not a replacement for the actual graft; it's an augmentation to provide extra stability while your tissue heals and strengthens. This technique can potentially allow for a more confident early rehabilitation. Dr. Naveen will consider using an internal brace if it can benefit your recovery (for example, if your ligament tissue quality allows for a partial repair with augmentation, or if you are eager to safely accelerate your rehab).</p>
              </li>
            </ul>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              The Surgeon will discuss all these options with you before surgery. Rest assured, he is proficient in <strong>all the modern ACL reconstruction techniques</strong> and will customize the procedure to what best fits your knee condition and lifestyle. Whether it's choosing the right graft or employing the latest surgical method, the goal is to ensure you have a <strong>stable knee</strong> that heals well and serves you in the long run.
            </p>
          </section>

          {/* What to Expect ACL Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              What to Expect Before, During, and After ACL Surgery
            </h2>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              Facing surgery can be intimidating, but knowing what to expect can help ease your mind. At our Bangalore clinic, we believe in guiding you through every step of the process – <strong>before, during, and after</strong> your ACL reconstruction – so you feel comfortable and prepared.
            </p>

            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              Before Surgery (Preparation and Prehab)
            </h3>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Thorough Evaluation:</strong> First, Dr. Naveen will perform a detailed evaluation of your knee. This includes a physical examination and usually an MRI scan to confirm the ACL tear and check for any other injuries (such as meniscus or cartilage damage) that might need attention during surgery. You'll discuss your medical history, activity goals, and any concerns.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Prehabilitation ("Prehab"):</strong> If time allows (for example, if your injury is not extremely recent or if swelling needs to subside), you may be advised to do some <strong>prehab exercises</strong> with a physiotherapist before surgery. Prehab focuses on gently restoring your knee's range of motion and strengthening the muscles (especially quadriceps and hamstrings). Going into surgery with a knee that can straighten and bend reasonably well, and with good muscle tone, can actually improve your post-surgery recovery speed. Don't worry if your knee still feels unstable – you'll typically wear a brace or be cautious to avoid buckling it during this period.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Preparation and Planning:</strong> Dr. Naveen will explain the surgical plan, including the likely graft choice and technique tailored for you. This is a great time to ask any questions about the procedure. You'll also get instructions for the day of surgery, such as fasting (not eating) for a certain period before the procedure, arranging for someone to drive you home, and preparing your home for post-op comfort (for example, getting ice packs, setting up a rest area, etc.). Our team will make sure all necessary blood tests and medical clearances (like fitness for anesthesia) are done prior to your surgery date.
            </p>

            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              During Surgery (The Procedure Day)
            </h3>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Admission and Anesthesia:</strong> On the day of surgery, you'll be admitted to the hospital or day-surgery center. ACL reconstruction is typically done under regional (spinal) anesthesia with sedation or general anesthesia – meaning you won't feel any pain during the procedure. The anesthesiologist will discuss the best option for you. Many patients receive a spinal anesthesia (numbing from the waist down) combined with light sleep sedation, so you stay comfortable and pain-free.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Arthroscopic Procedure:</strong> Dr. Naveen performs the ACL reconstruction <strong>arthroscopically</strong>. Through 2-3 tiny incisions around your knee, a small camera (arthroscope) and specialized instruments are inserted. First, any additional injuries are addressed – for example, trimming or stitching a torn meniscus if needed. Then, the remnants of the torn ACL are cleared out.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Graft Harvest and Placement:</strong> If using an autograft (your tissue), the graft will be harvested through a small incision (for example, a short cut over the upper shin for a hamstring graft, or over the knee for a patellar graft). This incision is kept as small as possible. The graft is prepared to the correct length and thickness. Next, Dr. Naveen will drill precise tunnels or sockets in your thigh and shin bones at the anatomic ACL attachment sites. The prepared graft is then passed through the knee and fixed securely into these bone tunnels – usually with devices like strong absorbable screws or suspensory buttons. (In an <strong>all-inside technique</strong>, as mentioned earlier, the fixation might be done entirely with buttons on both ends.) Dr. Naveen ensures the graft is properly tensioned (tight but not over-tight) and that your knee has full range of motion without impingement of the graft.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Duration and Wake Up:</strong> The surgery typically takes about 1 to 1.5 hours, though it can vary depending on complexity (for example, if we also repair other ligaments or a meniscus, it could be a bit longer). After the procedure, you'll be moved to a recovery room as the anesthesia wears off. Don't be surprised if you wake up with a padded bandage on your knee and maybe a brace; this is normal. Our team will monitor you until you're fully awake and comfortable.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Same-Day Discharge:</strong> ACL reconstruction is often a <strong>day-care surgery</strong>, meaning many patients go home the same day once they recover from anesthesia. In some cases, an overnight stay might be recommended (especially if surgery is done late in the day or if additional procedures were performed). Either way, you won't be in the hospital for long.
            </p>

            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              After Surgery (Recovery and Rehabilitation)
            </h3>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Immediate Post-Op:</strong> When you go home, your knee will be wrapped and possibly in a knee brace locked in a straight position (depending on Dr. Naveen's instructions and whether any other repairs were done). You'll likely be given crutches or a walker for support. Pain is managed with medications – expect some soreness, but many patients find it's less than they anticipated thanks to modern arthroscopic techniques and pain control methods. We'll advise you on icing the knee regularly to keep swelling down.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Weight-Bearing and Mobility:</strong> Surprisingly, you will be encouraged to start moving <strong>the same day or next day</strong>. In many cases, if only the ACL was reconstructed and the knee is stable, <strong>you can start walking with support almost immediately</strong> (typically with crutches or a walker for balance). Dr. Naveen often allows <strong>partial to full weight-bearing</strong> as tolerated right after surgery, especially if no other structures (like meniscus) need protection. For the first week, you'll use support and avoid long periods on your feet, but basic walking around the house is encouraged. By the end of the first week, many patients can put more weight on the leg and may even begin walking short distances <strong>without support</strong> (if advised by the doctor or physio). Everyone is a bit different, so follow the specific guidance given to you.
            </p>
            <p className="mb-4 sm:mb-6 leading-relaxed" style={{ color: brandColors.lightText }}>
              <strong>Follow-Up and Physiotherapy:</strong> You'll have a follow-up appointment within a week or two after surgery. Stitches (if any external ones) will be removed around 10-14 days. The <strong>physiotherapy (rehab)</strong> program starts almost immediately in the first week. Initially, the focus is on gentle exercises to regain knee <strong>range of motion</strong> (especially achieving full straightening and gradual bending) and to prevent muscle stiffness. A physiotherapist will teach you exercises and monitor your progress. Strengthening exercises for the quadriceps and hamstrings begin in a controlled way. By 4-6 weeks, the goal is usually to have near-normal walking without aids, full extension and a good bend in the knee, and improving muscle strength.
            </p>
          </section>

          {/* Rehabilitation Phases Section */}
          <section className="mb-10 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 sm:mt-8 sm:mb-4 pb-1 sm:pb-2 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '30' }}>
              Rehabilitation Phases
            </h3>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-fas-1 */}
                <h4 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>Weeks 0-6: Protective phase</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Reduce swelling, restore motion, begin basic strength exercises. You'll work on straightening the knee fully and bending it to at least 90-120 degrees gradually.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-fas-2 */}
                <h4 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>Weeks 6-12: Strength and balance phase</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  More intensive strengthening of the leg muscles, balance training, and core strengthening.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-fas-3 */}
                <h4 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>3 to 6 Months: Advanced training</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Higher level strengthening, agility drills, and gentle sport-specific movements under guidance.
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg border" style={{ borderColor: brandColors.accent + '20' }}>
                {/* Icon Placeholder: tf-fas-4 */}
                <h4 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>6 to 9 Months: Return to sport</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: brandColors.lightText }}>
                  Most patients are ready to carefully return to full sports or intense physical activities around the 6-8 month mark post-surgery with doctor's approval.
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b text-center" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              Testimonials
            </h2>
            <div className="text-center mb-6">
              <span style={{ color: brandColors.warning }}>★★★★★</span>
            </div>
            <div className="space-y-8">
              <div className="p-6 border rounded-lg shadow-lg" style={{ borderColor: brandColors.accent + '20', backgroundColor: brandColors.lightGray + '40' }}>
                <p className="italic leading-relaxed mb-4" style={{ color: brandColors.lightText }}>
                  "I tore my ACL while playing football and feared my sports days were over. Dr. Naveen performed my ACL reconstruction and guided me through rehab. <strong>Six months later, I was back on the field</strong> stronger than ever! I'm incredibly thankful for his expertise and encouragement throughout my recovery."
                </p>
                <p className="text-right font-semibold" style={{ color: brandColors.primary }}>
                  - Rohit K
                </p>
                <p className="text-right text-sm" style={{ color: brandColors.lightText }}>
                  Koramangala, Bangalore
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-lg" style={{ borderColor: brandColors.accent + '20', backgroundColor: brandColors.lightGray + '40' }}>
                <p className="italic leading-relaxed mb-4" style={{ color: brandColors.lightText }}>
                  "After my knee injury, I consulted several doctors but still felt nervous about surgery. Meeting Dr. Naveen put me at ease. He explained everything about the ACL tear and surgery in a way I could understand. The surgery went smoothly and the support I received was fantastic. It's been 7 months now and I'm jogging and trekking again without any instability. Choosing Dr. Naveen was the <strong>best decision for my knee</strong>."
                </p>
                <p className="text-right font-semibold" style={{ color: brandColors.primary }}>
                  - Priya M
                </p>
                <p className="text-right text-sm" style={{ color: brandColors.lightText }}>
                  HSR Layout, Bangalore
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-lg" style={{ borderColor: brandColors.accent + '20', backgroundColor: brandColors.lightGray + '40' }}>
                <p className="italic leading-relaxed mb-4" style={{ color: brandColors.lightText }}>
                  "I had a complete ACL and meniscus tear from a bike accident. Dr. Naveen did an excellent job with the reconstruction and also repaired my meniscus. I was walking with support within a week and recovered much faster than I expected. His rehab team was top-notch, pushing me just the right amount. <strong>Today, I can climb stairs, run, and even play badminton with confidence.</strong> Big thanks to Dr. Naveen and his team for giving me my life back"
                </p>
                <p className="text-right font-semibold" style={{ color: brandColors.primary }}>
                  - Anil S
                </p>
                <p className="text-right text-sm" style={{ color: brandColors.lightText }}>
                  Electronic City, Bangalore
                </p>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 sm:mt-10 sm:mb-6 pb-2 sm:pb-3 border-b" style={{ color: brandColors.primary, borderColor: brandColors.accent + '40' }}>
              Frequently Asked Questions (FAQs)
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`} className="border rounded-md shadow-sm" style={{ borderColor: brandColors.accent + '30', backgroundColor: brandColors.lightGray + '20' }}>
                  <AccordionTrigger className="p-4 sm:p-5 text-left font-medium hover:no-underline" style={{ color: brandColors.primary }}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 sm:p-5 pt-0 text-sm sm:text-base" style={{ color: brandColors.lightText }}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Call to Action Section */}
          <section className="text-center py-8 sm:py-10 mt-10 sm:mt-12 bg-white rounded-lg shadow-md border border-soi-navy-200">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6" style={{ color: brandColors.primary }}>
              Ready to Discuss Your ACL Options?
            </h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: brandColors.lightText }}>
              An ACL injury shouldn't keep you from living your life. Contact Dr. Naveen Kumar for an expert consultation on ACL reconstruction surgery in Bangalore.
            </p>
            <Link href="/book-appointment" legacyBehavior>
              <a className="inline-block text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition duration-300 text-base sm:text-lg border-2 border-soi-pink-400" style={{ backgroundColor: brandColors.primary, color: brandColors.background }}>
                Book Your Consultation
              </a>
            </Link>
          </section>

        </article>
      </main>
      <SiteFooter />
    </>
  );
};
export default ACLReconstructionPage; 