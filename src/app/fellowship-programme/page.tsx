import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import HeroSection from '@/components/ui/HeroSection';
import FellowshipApplicationForm from './components/FellowshipApplicationForm';
import { CheckCircle2, Calendar, IndianRupee, Clock, GraduationCap, Stethoscope, Microscope, Award, TrendingUp, HandHeart } from 'lucide-react';

export default function FellowshipProgrammePage() {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <SiteHeader theme="transparent" />

            {/* Hero Section */}
            <HeroSection
                variant="image"
                height="medium"
                bgColor="#0b1221"
                bgImage="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
                title={
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-block bg-soi-purple-500/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-soi-purple-500/30">
                            ADVANCED ORTHOPEDIC TRAINING
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                            FELLOWSHIP PROGRAMME
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
                            A well-rounded understanding of Orthopedics, Clinical diagnostic and communication skills, surgical skills in arthroscopy and arthroplasty.
                        </p>
                    </div>
                }
            />

            <main className="flex-grow">
                {/* Key Highlights Ribbon */}
                <section className="bg-soi-navy-900 border-b border-soi-navy-800 text-white py-8 relative -mt-4 z-10 mx-4 md:mx-auto max-w-7xl rounded-xl shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 divide-y md:divide-y-0 md:divide-x divide-soi-navy-700">
                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="bg-soi-purple-500/20 p-3 rounded-full">
                                <Clock className="w-6 h-6 text-soi-purple-400" />
                            </div>
                            <div>
                                <p className="text-soi-navy-300 text-sm font-medium uppercase tracking-wider">Duration</p>
                                <p className="text-xl font-semibold">6 Months - 1 Year</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="bg-soi-mint-500/20 p-3 rounded-full">
                                <IndianRupee className="w-6 h-6 text-soi-mint-400" />
                            </div>
                            <div>
                                <p className="text-soi-navy-300 text-sm font-medium uppercase tracking-wider">Stipend</p>
                                <p className="text-xl font-semibold">Competitive Stipend</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="bg-blue-500/20 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-soi-navy-300 text-sm font-medium uppercase tracking-wider">Apply In</p>
                                <p className="text-xl font-semibold">Feb & Aug</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-16 space-y-20 max-w-6xl">

                    {/* WHY WE RUN FELLOWSHIP PROGRAMME? */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-soi-purple-100 text-soi-purple-700 rounded-full text-sm font-medium">
                                <HandHeart className="w-4 h-4" />
                                <span>Our Vision</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-900 leading-tight uppercase">
                                WHY WE RUN FELLOWSHIP PROGRAMME?
                            </h2>
                            <p className="text-lg text-soi-navy-700 leading-relaxed">
                                We have noticed the lack of well-rounded PG programmes in India. We felt that there is a need for the Young Surgeons to equip themselves further with proper diagnostic skills, clinical correlation with the MRI and other imaging methods, arthroscopic and arthroplasty skills.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-soi-purple-600 rounded-2xl transform rotate-3 opacity-10"></div>
                            <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <h3 className="text-xl font-bold text-soi-navy-800 mb-6 flex items-center gap-2 uppercase">
                                    <GraduationCap className="w-6 h-6 text-soi-purple-500" />
                                    WHAT ARE THE BASIC QUALIFICATIONS NECESSARY TO APPLY FOR FELLOWSHIP?
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-soi-navy-500 uppercase tracking-widest mb-2">Basic Qualifications</h4>
                                        <p className="text-lg font-medium text-soi-navy-800 bg-gray-50 p-3 rounded-lg border-l-4 border-soi-purple-500">
                                            MS Ortho / DNB Orth
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-soi-navy-700">
                                            We welcome people with further qualifications such as MCh, MRCS for further higher training.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Program Content Grid */}
                    <section>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-soi-navy-900 mb-4 uppercase">WHAT TO EXPECT FROM THE FELLOWSHIP PROGRAMME?</h2>
                            <p className="text-lg text-soi-navy-600 max-w-2xl mx-auto">
                                A well-rounded understanding of Orthopedics, Clinical diagnostic and communication skills, surgical skills in arthroscopy and arthroplasty.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Stethoscope className="w-8 h-8 text-blue-500" />,
                                    title: "HOW LONG DOES THE FELLOWSHIP PROGRAMME RUN FOR?",
                                    desc: "It typically runs for 6 months and is extendable upto 1 year depending on the needs of the trainee and availability of the slots."
                                },
                                {
                                    icon: <Microscope className="w-8 h-8 text-purple-500" />,
                                    title: "IS THERE AN OPPORTUNITY TO DO RESEARCH PROJECTS?",
                                    desc: "Yes. There is. We encourage our fellows to start research projects early after joining so that they can complete the projects on time. There will be support for research topics and for writing the articles."
                                },
                                {
                                    icon: <Award className="w-8 h-8 text-yellow-500" />,
                                    title: "IS THERE A CERTIFICATION AT THE END OF THE FELLOWSHIP?",
                                    desc: "Yes, you will receive the Completion certificate for this esteemed Fellowship. Currently, we are not conducting exams for completion of the Fellowship, but it is based on the informal assessments of the understanding the subject, surgical skill sets, communication skills and more."
                                }
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group">
                                    <div className="mb-6 p-4 rounded-full bg-gray-50 inline-block group-hover:scale-110 transition-transform duration-300">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-soi-navy-900 mb-3 uppercase">{card.title}</h3>
                                    <p className="text-soi-navy-600 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Future Prospects & Apply */}
                    <section className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left Column: Future & Info */}
                        <div className="space-y-12">

                            <div className="bg-gradient-to-br from-soi-navy-900 to-soi-navy-700 text-white p-8 rounded-2xl shadow-xl">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl text-white font-bold mb-2 uppercase">WHAT ARE THE FUTURE PROSPECTS POST THIS FELLOWSHIP?</h3>
                                        <p className="text-white/80 leading-relaxed">
                                            Post fellowship, as you will be equipped with better understanding of the field and surgical skills, you may wish to open your own clinical set up / work in a hospital / get absorbed to our team.
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-6 pt-6 border-t border-white/10 text-sm text-white/60">
                                    You will receive support from us to find placements wherever possible.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-soi-navy-900 mb-4 uppercase">WHEN TO APPLY FOR FELLOWSHIP?</h3>
                                <div className="prose prose-lg text-soi-navy-600">
                                    <p>
                                        It gets advertised on all our social media handles twice a year – 1st week of February and 1st week of August for Summer and Winter Fellowships respectively.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-soi-mint-50 p-6 rounded-xl border border-soi-mint-200">
                                <h3 className="text-xl font-bold text-soi-navy-900 mb-2 uppercase">IS THERE ANY FEES FOR FELLOWSHIP? AND ANY RENUMERATION DURING FELLOWSHIP?</h3>
                                <p className="text-soi-navy-700">
                                    We don’t charge any fees for this fellowship. You will be paid a sustenance of INR 75000 (Seventy-Five Thousand) per month during the fellowship.
                                </p>
                            </div>

                        </div>

                        {/* Right Column: Form */}
                        <div id="apply-form" className="relative sticky top-24">
                            {/* Decorative elements behind form */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-soi-mint-200 rounded-full opacity-20 blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-soi-purple-200 rounded-full opacity-20 blur-3xl"></div>

                            <FellowshipApplicationForm />
                        </div>

                    </section>

                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
