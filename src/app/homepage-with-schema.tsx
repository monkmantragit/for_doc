import { Metadata } from 'next';
import HomePage from './homepage/page';
import SchemaMarkup from '@/components/SchemaMarkup';
import {
  createOrganizationSchema,
  createMedicalClinicSchema,
  createWebSiteSchema,
  createBreadcrumbSchema,
} from '@/lib/schema/utils';

export const metadata: Metadata = {
  title: 'Sports Orthopedics Institute | Excellence in Motion',
  description: 'Sports Orthopedics Institute offers specialized orthopedic care for sports injuries, joint reconstruction, and comprehensive treatment of musculoskeletal conditions.',
};

export default function HomePageWithSchema() {
  const schemas = [
    createOrganizationSchema(),
    createMedicalClinicSchema(),
    createWebSiteSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://sportsorthopedics.in' }
    ])
  ];

  return (
    <>
      <SchemaMarkup schema={schemas} />
      <HomePage />
    </>
  );
}