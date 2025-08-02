'use client';

import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Component, 
  Smartphone, 
  Maximize2, 
  MinusSquare,
  PlusSquare,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-tint-authority">
      {/* Header */}
      <header className="bg-white border-b border-soi-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-soi-navy-800">SOI Design System</h1>
          <p className="mt-2 text-soi-navy-600">Sports Orthopedics Institute brand guidelines and components</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Brand Colors */}
        <section className="bg-white rounded-xl shadow-sm border border-soi-navy-200 overflow-hidden">
          <div className="p-6 border-b border-soi-navy-200">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-soi-purple-500" />
              <h2 className="text-xl font-semibold text-soi-navy-800">SOI Brand Colors</h2>
            </div>
            <p className="text-soi-navy-600">Our medical color palette emphasizes trust, expertise, care, and wellness</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Navy - Authority */}
              <div className="space-y-3">
                <div className="h-32 bg-soi-navy-500 rounded-lg shadow-sm border-2 border-soi-navy-600"></div>
                <div>
                  <p className="font-medium text-soi-navy-800">Navy - Authority</p>
                  <p className="text-sm text-soi-navy-500">#1e3a5f</p>
                  <p className="text-xs text-soi-navy-400 mt-1">Trust, professionalism, headers</p>
                </div>
              </div>

              {/* Purple - Expertise */}
              <div className="space-y-3">
                <div className="h-32 bg-soi-purple-500 rounded-lg shadow-sm border-2 border-soi-purple-600"></div>
                <div>
                  <p className="font-medium text-soi-navy-800">Purple - Expertise</p>
                  <p className="text-sm text-soi-navy-500">#8B5C9E</p>
                  <p className="text-xs text-soi-navy-400 mt-1">Medical knowledge, existing brand</p>
                </div>
              </div>

              {/* Pink - Care */}
              <div className="space-y-3">
                <div className="h-32 bg-soi-pink-500 rounded-lg shadow-sm border-2 border-soi-pink-600"></div>
                <div>
                  <p className="font-medium text-soi-navy-800">Pink - Care</p>
                  <p className="text-sm text-soi-navy-500">#d4a5b8</p>
                  <p className="text-xs text-soi-navy-400 mt-1">Human connection, patient care</p>
                </div>
              </div>

              {/* Mint - Wellness */}
              <div className="space-y-3">
                <div className="h-32 bg-soi-mint-500 rounded-lg shadow-sm border-2 border-soi-mint-600"></div>
                <div>
                  <p className="font-medium text-soi-navy-800">Mint - Wellness</p>
                  <p className="text-sm text-soi-navy-500">#a8c4a2</p>
                  <p className="text-xs text-soi-navy-400 mt-1">Recovery, success, wellness</p>
                </div>
              </div>
            </div>

            {/* Color Usage Guidelines */}
            <div className="mt-8 pt-6 border-t border-soi-navy-200">
              <h3 className="text-lg font-medium text-soi-navy-800 mb-4">Usage Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-soi-navy-500 rounded"></div>
                    <span className="text-sm text-soi-navy-700">Navy: Navigation, headers, primary CTAs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-soi-purple-500 rounded"></div>
                    <span className="text-sm text-soi-navy-700">Purple: Expertise sections, secondary CTAs</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-soi-pink-500 rounded"></div>
                    <span className="text-sm text-soi-navy-700">Pink: Patient care, testimonials, human elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-soi-mint-500 rounded"></div>
                    <span className="text-sm text-soi-navy-700">Mint: Success stories, recovery, wellness outcomes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-xl shadow-sm border border-soi-navy-200 overflow-hidden">
          <div className="p-6 border-b border-soi-navy-200">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-soi-purple-500" />
              <h2 className="text-xl font-semibold text-soi-navy-800">Typography</h2>
            </div>
            <p className="text-soi-navy-600">Font hierarchy optimized for medical content readability</p>
          </div>
          
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-soi-navy-800">Heading 1 - Navy Authority</h1>
              <p className="mt-1 text-sm text-soi-navy-500">Font: Inter / 30px / Semi Bold / Navy #1e3a5f</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-soi-purple-600">Heading 2 - Purple Expertise</h2>
              <p className="mt-1 text-sm text-soi-navy-500">Font: Inter / 24px / Semi Bold / Purple #8B5C9E</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-soi-navy-700">Heading 3 - Navy Professional</h3>
              <p className="mt-1 text-sm text-soi-navy-500">Font: Inter / 20px / Semi Bold / Navy 700</p>
            </div>
            <div>
              <p className="text-base text-soi-navy-600">Body Text - Optimal readability for medical content</p>
              <p className="mt-1 text-sm text-soi-navy-500">Font: Inter / 16px / Regular / Navy 600</p>
            </div>
            <div>
              <p className="text-sm text-soi-navy-500">Small Text - Supporting information and metadata</p>
              <p className="mt-1 text-sm text-soi-navy-500">Font: Inter / 14px / Regular / Navy 500</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="bg-white rounded-xl shadow-sm border border-soi-navy-200 overflow-hidden">
          <div className="p-6 border-b border-soi-navy-200">
            <div className="flex items-center gap-2 mb-4">
              <Component className="w-5 h-5 text-soi-purple-500" />
              <h2 className="text-xl font-semibold text-soi-navy-800">SOI Components</h2>
            </div>
            <p className="text-soi-navy-600">Medical UI components with SOI brand styling</p>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-soi-navy-800">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-soi-navy-500 text-white rounded-lg hover:bg-soi-navy-600 transition-colors">
                  Navy Authority
                </button>
                <button className="px-4 py-2 bg-soi-purple-500 text-white rounded-lg hover:bg-soi-purple-600 transition-colors">
                  Purple Expertise
                </button>
                <button className="px-4 py-2 border border-soi-pink-400 text-soi-pink-600 rounded-lg hover:bg-soi-pink-50 transition-colors">
                  Pink Care
                </button>
                <button className="px-4 py-2 bg-soi-mint-500 text-white rounded-lg hover:bg-soi-mint-600 transition-colors">
                  Mint Wellness
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-soi-navy-800">Form Elements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Patient information..."
                  className="px-4 py-2 border border-soi-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soi-pink-500 focus:border-transparent text-soi-navy-800"
                />
                <select className="px-4 py-2 border border-soi-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-soi-purple-500 focus:border-transparent text-soi-navy-800">
                  <option>Select specialty...</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-soi-navy-800">Medical Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-soi-purple-200 rounded-xl shadow-sm hover:shadow-md hover:border-soi-purple-400 transition-all">
                  <h4 className="font-medium text-soi-navy-800">Service Card</h4>
                  <p className="mt-2 text-sm text-soi-navy-600">Medical service information with purple expertise theme.</p>
                </div>
                <div className="p-4 bg-soi-pink-50 border border-soi-pink-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-soi-navy-800">Care Card</h4>
                  <p className="mt-2 text-sm text-soi-navy-600">Patient testimonial with pink care theme.</p>
                </div>
                <div className="p-4 bg-soi-mint-50 border border-soi-mint-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-soi-navy-800">Success Card</h4>
                  <p className="mt-2 text-sm text-soi-navy-600">Recovery story with mint wellness theme.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile First Design */}
        <section className="bg-white rounded-xl shadow-sm border border-soi-navy-200 overflow-hidden">
          <div className="p-6 border-b border-soi-navy-200">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-soi-purple-500" />
              <h2 className="text-xl font-semibold text-soi-navy-800">Mobile First Medical Design</h2>
            </div>
            <p className="text-soi-navy-600">Accessibility principles for medical mobile interfaces</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Maximize2 className="w-6 h-6 text-soi-mint-500" />
                <h3 className="font-medium text-soi-navy-800">Touch Targets</h3>
                <p className="text-sm text-soi-navy-600">Minimum 44x44px for medical appointment booking and patient forms</p>
              </div>
              
              <div className="space-y-2">
                <MinusSquare className="w-6 h-6 text-soi-pink-500" />
                <h3 className="font-medium text-soi-navy-800">Medical Spacing</h3>
                <p className="text-sm text-soi-navy-600">Consistent 4px spacing for clear medical information hierarchy</p>
              </div>
              
              <div className="space-y-2">
                <PlusSquare className="w-6 h-6 text-soi-purple-500" />
                <h3 className="font-medium text-soi-navy-800">Patient-First Enhancement</h3>
                <p className="text-sm text-soi-navy-600">Core medical features accessible on all devices, enhanced for desktop</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Interactions */}
        <section className="bg-white rounded-xl shadow-sm border border-soi-navy-200 overflow-hidden">
          <div className="p-6 border-b border-soi-navy-200">
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-5 h-5 text-soi-purple-500" />
              <h2 className="text-xl font-semibold text-soi-navy-800">Medical UX Features</h2>
            </div>
            <p className="text-soi-navy-600">Patient-centered interaction patterns and medical accessibility</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-soi-mint-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-soi-navy-800">Smooth Medical Transitions</h3>
                  <p className="text-sm text-soi-navy-600">Calming animations for patient comfort during booking and forms</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-soi-mint-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-soi-navy-800">Clear Medical Error Handling</h3>
                  <p className="text-sm text-soi-navy-600">Patient-friendly error messages with clear next steps</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-soi-mint-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-soi-navy-800">Medical Loading States</h3>
                  <p className="text-sm text-soi-navy-600">Professional loading indicators for appointment booking and patient data</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-soi-mint-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-soi-navy-800">Patient Form Validation</h3>
                  <p className="text-sm text-soi-navy-600">Real-time validation with mint success and clear error feedback</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DesignSystem; 