/**
 * Central site content. Anything marked PLACEHOLDER must be confirmed
 * with John before launch — search this file for "PLACEHOLDER".
 */

export const site = {
  name: "Azimuth Real Estate",
  person: "John Khellah, MBA",
  role: "Broker of Record, Azimuth Real Estate",
  // PLACEHOLDER — confirm before launch
  phone: "(201) 000-0000",
  email: "john@azimuthrealestate.com",
  officeAddress: "Azimuth Real Estate — office address to confirm, Jersey City, NJ",
  academyAddress: "233 Terrace Ave, Jersey City, NJ 07307",
  hours: [
    { day: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
    { day: "Saturday", time: "By appointment" },
    { day: "Sunday", time: "Closed" },
  ],
  licenseDisclaimer:
    "PLACEHOLDER — NJ Real Estate License #0000000. Azimuth Real Estate is licensed by the New Jersey Real Estate Commission. Confirm license number and brokerage disclosure language before launch.",
  socials: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    facebook: "https://facebook.com/",
  },
} as const;

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About John", to: "/about" },
  { label: "Brokerage", to: "/brokerage" },
  { label: "Academy", to: "/academy" },
  { label: "Video Library", to: "/videos" },
  { label: "Contact", to: "/contact" },
] as const;

export const trustPoints = [
  { value: 2012, prefix: "Licensed since ", label: "New Jersey real estate license" },
  { value: null, prefix: "Broker of Record", label: "Azimuth Real Estate" },
  { value: null, prefix: "MBA, Finance", label: "Villanova University" },
  { value: null, prefix: "Instructor", label: "Bergen Community College" },
  { value: null, prefix: "Jersey City native", label: "Born, raised, and working here" },
] as const;

export const counties = ["Hudson County", "Bergen County", "Essex County", "Passaic County"];

export const services = [
  {
    icon: "building",
    title: "Landlord Representation",
    body: "Full-service leasing for owners: pricing, marketing, screening, and renewals. You keep the asset; we keep it occupied with the right tenants.",
  },
  {
    icon: "trending",
    title: "Multifamily Investment Sales",
    body: "Positioning and selling small to mid-size multifamily assets across Northern New Jersey. Buyers are underwritten before they ever tour your building.",
  },
  {
    icon: "store",
    title: "Commercial Leasing",
    body: "Retail, office, and mixed-use space leased with clear terms. We negotiate escalations and concessions with the long-term value of the asset in mind.",
  },
  {
    icon: "calculator",
    title: "Investment Analysis & Valuation",
    body: "Rent rolls, expense audits, and cap-rate driven valuations. You get the math behind the number, not just the number.",
  },
  {
    icon: "compass",
    title: "Property Owner Consulting",
    body: "Hold, refinance, reposition, or sell — an honest read on your options. Advice first, transaction second.",
  },
] as const;

export const processSteps = [
  { step: "01", title: "Consultation", body: "We talk through the property, the numbers you have, and what you actually want out of it." },
  { step: "02", title: "Analysis", body: "Rent roll and expense review, comparable sales and leases, and a defensible valuation range." },
  { step: "03", title: "Marketing & Negotiation", body: "Targeted exposure to qualified buyers or tenants, then disciplined negotiation on your terms." },
  { step: "04", title: "Closing", body: "Due diligence coordination through the closing table, with clear updates at every step." },
] as const;

/** PLACEHOLDER programs — pricing, length, and format all to be confirmed. */
export const programs = [
  { title: "Real Estate Investing Fundamentals", format: "In-person", length: "6 weeks", price: "$—" },
  { title: "Commercial & Multifamily Basics", format: "Hybrid", length: "4 weeks", price: "$—" },
  { title: "New Agent Launch Program", format: "In-person", length: "8 weeks", price: "$—" },
  { title: "Exam Prep", format: "Online", length: "Self-paced", price: "$—" },
] as const;

/** PLACEHOLDER FAQ — replace answers with John's own wording. */
export const academyFaq = [
  { q: "Do I need a license to take a course?", a: "PLACEHOLDER ANSWER — confirm with John." },
  { q: "Are classes in person or online?", a: "PLACEHOLDER ANSWER — confirm with John." },
  { q: "How long is the New Agent Launch Program?", a: "PLACEHOLDER ANSWER — confirm with John." },
  { q: "Is there payment flexibility?", a: "PLACEHOLDER ANSWER — confirm with John." },
  { q: "Do you help with job placement at a brokerage?", a: "PLACEHOLDER ANSWER — confirm with John." },
  { q: "Can I audit a class before enrolling?", a: "PLACEHOLDER ANSWER — confirm with John." },
] as const;

/** PLACEHOLDER testimonials — replace with real, attributed quotes. */
export const testimonials = [
  { quote: "PLACEHOLDER TESTIMONIAL — a short quote from an owner about the sale or lease of their building.", name: "Owner name", detail: "Multifamily owner, Hudson County" },
  { quote: "PLACEHOLDER TESTIMONIAL — a quote from a student about the class and what changed afterward.", name: "Student name", detail: "New Agent Launch Program" },
  { quote: "PLACEHOLDER TESTIMONIAL — a quote from an investor about the analysis and negotiation.", name: "Investor name", detail: "Investor, Bergen County" },
] as const;

export const timeline = [
  { year: "Jersey City", title: "Hometown", body: "Born and raised in Jersey City — the market he now works in every day." },
  { year: "Education", title: "Montclair State University", body: "B.S. in Mathematics and B.S. in Computer Science." },
  { year: "Education", title: "Villanova University", body: "MBA with a concentration in finance." },
  { year: "Pre-2012", title: "Defense, supply chain, technology, insurance", body: "Roles across accounting, IT, finance, and sales before real estate." },
  { year: "May 2012", title: "Licensed in real estate", body: "Began a career in New Jersey real estate." },
  { year: "Brokerage", title: "Coldwell Banker Realty", body: "Commercial agent focused on investment property." },
  { year: "Brokerage", title: "Group Twenty Six Real Estate", body: "Associate Broker." },
  { year: "2019", title: "Azimuth Real Estate Academy", body: "Founded in Jersey City to teach real estate the practical way." },
  { year: "Today", title: "Broker of Record, Azimuth Real Estate", body: "Commercial multifamily investment sales and landlord representation, plus instruction at Bergen Community College." },
] as const;

export const credentials = {
  education: [
    "B.S. Mathematics — Montclair State University",
    "B.S. Computer Science — Montclair State University",
    "MBA, Finance concentration — Villanova University",
  ],
  licenses: [
    "New Jersey Real Estate Broker — licensed since May 2012",
    "Broker of Record, Azimuth Real Estate",
    "PLACEHOLDER — license number to confirm",
  ],
  affiliations: [
    "Instructor, Azimuth Real Estate Academy",
    "Instructor, Bergen Community College",
    "PLACEHOLDER — association memberships to confirm",
  ],
};

export const videoCategoryOrder = [
  "Market Updates",
  "Investing",
  "For New Agents",
  "Lessons",
  "Property Tours",
  "Q&A",
];
