export interface SchemaBase {
  '@context': 'https://schema.org';
  '@type': string | string[];
}

export interface Organization extends SchemaBase {
  '@type': 'Organization' | 'MedicalOrganization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  address?: PostalAddress;
  telephone?: string;
  email?: string;
  foundingDate?: string;
  areaServed?: string | GeoCircle;
}

export interface MedicalClinic extends SchemaBase {
  '@type': 'MedicalClinic';
  name: string;
  url: string;
  logo?: string;
  image?: string | string[];
  description?: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  telephone?: string;
  email?: string;
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  medicalSpecialty?: MedicalSpecialty | MedicalSpecialty[];
  availableService?: MedicalProcedure[];
  hasOfferCatalog?: OfferCatalog;
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface GeoCircle {
  '@type': 'GeoCircle';
  geoMidpoint: GeoCoordinates;
  geoRadius: string;
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface Person extends SchemaBase {
  '@type': 'Person' | 'Physician';
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: Organization | MedicalClinic;
  description?: string;
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  sameAs?: string[];
}

export interface Physician extends Person {
  '@type': 'Physician';
  medicalSpecialty?: MedicalSpecialty | MedicalSpecialty[];
  availableService?: MedicalProcedure[];
  hospitalAffiliation?: Hospital[];
  memberOf?: Organization[];
  alumniOf?: EducationalOrganization[];
}

export interface Article extends SchemaBase {
  '@type': 'Article' | 'BlogPosting' | 'MedicalScholarlyArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: Person | Organization;
  publisher?: Organization;
  mainEntityOfPage?: WebPage;
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
  inLanguage?: string;
}

export interface BlogPosting extends Article {
  '@type': 'BlogPosting';
}

export interface MedicalScholarlyArticle extends Article {
  '@type': 'MedicalScholarlyArticle';
  publicationType?: string;
}

export interface WebPage extends SchemaBase {
  '@type': 'WebPage';
  '@id': string;
  url?: string;
  name?: string;
  description?: string;
  breadcrumb?: BreadcrumbList;
  mainEntity?: any;
}

export interface BreadcrumbList extends SchemaBase {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface VideoObject extends SchemaBase {
  '@type': 'VideoObject';
  name: string;
  description?: string;
  thumbnailUrl?: string | string[];
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  interactionStatistic?: InteractionCounter;
}

export interface InteractionCounter {
  '@type': 'InteractionCounter';
  interactionType: string;
  userInteractionCount: number;
}

export interface MedicalProcedure extends SchemaBase {
  '@type': 'MedicalProcedure' | 'MedicalTherapy' | 'SurgicalProcedure';
  name: string;
  description?: string;
  procedureType?: MedicalProcedureType;
  followup?: string;
  preparation?: string;
  bodyLocation?: string;
  outcome?: MedicalEntity;
  indication?: MedicalEntity;
  contraindication?: MedicalEntity;
}

export interface FAQPage extends SchemaBase {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question extends SchemaBase {
  '@type': 'Question';
  name: string;
  acceptedAnswer: Answer;
}

export interface Answer extends SchemaBase {
  '@type': 'Answer';
  text: string;
}

export interface ImageObject extends SchemaBase {
  '@type': 'ImageObject';
  contentUrl: string;
  caption?: string;
  description?: string;
  name?: string;
  uploadDate?: string;
}

export interface ImageGallery extends SchemaBase {
  '@type': 'ImageGallery';
  name: string;
  description?: string;
  image: ImageObject[];
}

export interface Event extends SchemaBase {
  '@type': 'Event' | 'EducationEvent';
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: Place | VirtualLocation;
  organizer?: Organization | Person;
  performer?: Person[];
  image?: string;
  eventStatus?: EventStatusType;
  eventAttendanceMode?: EventAttendanceMode;
}

export interface EducationalOccupationalProgram extends SchemaBase {
  '@type': 'EducationalOccupationalProgram';
  name: string;
  description?: string;
  provider?: Organization;
  url?: string;
  educationalProgramMode?: string;
  timeToComplete?: string;
  programType?: string;
  occupationalCategory?: string;
}

export interface Course extends SchemaBase {
  '@type': 'Course';
  name: string;
  description?: string;
  provider?: Organization;
  courseCode?: string;
  coursePrerequisites?: string;
  educationalLevel?: string;
  teaches?: string;
}

export interface LocalBusiness extends SchemaBase {
  '@type': 'LocalBusiness';
  name: string;
  image?: string | string[];
  '@id'?: string;
  url?: string;
  telephone?: string;
  priceRange?: string;
  address?: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification?: OpeningHoursSpecification[];
  sameAs?: string[];
}

export interface SearchAction extends SchemaBase {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

export interface WebSite extends SchemaBase {
  '@type': 'WebSite';
  '@id'?: string;
  url: string;
  name: string;
  description?: string;
  publisher?: Organization;
  potentialAction?: SearchAction[];
  inLanguage?: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface Review {
  '@type': 'Review';
  reviewRating: Rating;
  author: Person | Organization;
  datePublished?: string;
  reviewBody?: string;
}

export interface Rating {
  '@type': 'Rating';
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

export interface OfferCatalog {
  '@type': 'OfferCatalog';
  name: string;
  itemListElement: Offer[];
}

export interface Offer {
  '@type': 'Offer';
  itemOffered: Service;
  price?: string;
  priceCurrency?: string;
}

export interface Service {
  '@type': 'Service';
  name: string;
  description?: string;
}

export interface Hospital {
  '@type': 'Hospital';
  name: string;
  url?: string;
  address?: PostalAddress;
}

export interface EducationalOrganization {
  '@type': 'EducationalOrganization';
  name: string;
  url?: string;
  address?: PostalAddress;
}

export interface Place {
  '@type': 'Place';
  name?: string;
  address?: PostalAddress;
}

export interface VirtualLocation {
  '@type': 'VirtualLocation';
  url?: string;
}

export type MedicalSpecialty = 
  | 'Orthopedic'
  | 'SportsMedicine'
  | 'Rheumatology'
  | 'PhysicalTherapy'
  | 'EmergencyMedicine'
  | 'Surgery';

export type MedicalProcedureType = 
  | 'SurgicalProcedure'
  | 'TherapeuticProcedure'
  | 'DiagnosticProcedure'
  | 'PalliativeProcedure';

export type EventStatusType = 
  | 'EventScheduled'
  | 'EventCancelled'
  | 'EventMovedOnline'
  | 'EventPostponed'
  | 'EventRescheduled';

export type EventAttendanceMode = 
  | 'OfflineEventAttendanceMode'
  | 'OnlineEventAttendanceMode'
  | 'MixedEventAttendanceMode';

export type MedicalEntity = {
  '@type': 'MedicalEntity';
  name: string;
  description?: string;
};