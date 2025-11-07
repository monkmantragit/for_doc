import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Surgical Procedures | Orthopedic Surgery Options'
  },
  description: 'Explore our specialized surgical procedures for joint, bone, and muscle conditions. Learn about recovery times, benefits, and treatment options.',
  keywords: 'orthopedic surgery, surgical procedures, joint surgery, bone surgery, sports medicine surgery',
  openGraph: {
    title: 'Surgical Procedures | Orthopedic Surgery Options',
    description: 'Explore our specialized surgical procedures for joint, bone, and muscle conditions.',
    type: 'website',
  },
};

export default function ProcedureSurgeryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 