# Azimuth Edge

Build a modern, professional website for John Khellah, MBA — Broker of Record at Azimuth Real Estate and founder/instructor at Azimuth Real Estate Academy, based in Jersey City, New Jersey. The site serves two audiences equally: (1) property owners and investors looking for a commercial / multifamily broker in Northern New Jersey, and (2) people who want to learn real estate from John through classes and his video content. The centerpiece feature is a beautifully designed Video Library where John can publish all of his videos.

TECH AND SETUP

- React + Vite + TypeScript, Tailwind CSS, shadcn/ui components, Framer Motion for subtle animations.

- Connect Supabase for the database and storage. Create a `videos` table with: id, title, description, category, tags (text array), source_type (enum: youtube, vimeo, upload), source_url (YouTube/Vimeo URL or Supabase Storage path), thumbnail_url, duration_seconds, published_at, is_featured (boolean), sort_order, view_count. Create a Supabase Storage bucket called `videos` for direct uploads and one called `thumbnails`.

- Seed the videos table with 12 placeholder entries (use a public sample YouTube URL and neutral placeholder thumbnails) so the library looks full while we wait for the real videos. Make it obvious in the admin that these are placeholders.

- Fully responsive, mobile-first. Fast: lazy-load video thumbnails and only load the player when a video is opened.

- SEO basics: proper page titles, meta descriptions, Open Graph tags, semantic HTML, sitemap.

BRAND AND VISUAL DIRECTION

- Tone: confident, credible, approachable. A broker who is also a teacher — professional but not corporate-stiff.

- Palette: deep navy (#0B1F3A) as the primary, warm gold/brass (#C9A24D) as the accent, off-white (#F7F6F2) backgrounds, charcoal text. Use the gold sparingly for CTAs and highlights.

- Typography: a clean geometric sans for headings (Manrope or Sora) and Inter for body.

- Imagery: leave clearly labeled placeholders for a professional headshot of John, the Azimuth logo, and property/classroom photography. Use tasteful gradient or abstract placeholders until real assets arrive — no cheesy stock photos.

- Generous whitespace, large section headings, rounded-xl cards with soft shadows, consistent 8px spacing scale.

SITE STRUCTURE (top navigation)

Home · About John · Brokerage · Academy · Video Library · Contact. Sticky header with the logo, nav links, and a gold "Book a Consultation" button. Footer with contact info, social links (Instagram, LinkedIn, Facebook), an NJ real estate license disclaimer placeholder, and an equal-housing-opportunity notice.

1. HOME

- Hero: headline "Commercial Real Estate Brokerage & Education in Northern New Jersey." Subhead: "John Khellah, MBA — Broker of Record at Azimuth Real Estate and real estate instructor. Helping owners maximize their properties and helping new agents and investors master the business." Two CTAs: "Work With John" (to Contact) and "Watch the Latest Videos" (to Video Library). Headshot placeholder on the right.

- Trust strip: "Licensed since 2012" · "Broker of Record" · "MBA, Villanova University" · "Instructor, Bergen Community College" · "Jersey City native."

- Two-path section: side-by-side cards — "For Owners & Investors" (brokerage services) and "For Students & New Agents" (academy + videos), each with a short blurb and a link.

- Featured Videos: a horizontal row of 4 featured videos pulled from the database (is_featured = true), with a "See all videos" link.

- About teaser: 2–3 sentences on John's story (engineer-turned-broker — math and computer science degrees, MBA in finance, worked in defense and technology before real estate) with a "Read John's Story" link.

- Testimonials section with 3 placeholder quotes, clearly marked as placeholders.

- Final CTA band: "Ready to talk about your property or your career?" with phone, email, and a consultation button.

2. ABOUT JOHN

- Long-form bio using this information: Jersey City native; B.S. in Mathematics and B.S. in Computer Science from Montclair State University; MBA with a finance concentration from Villanova University; prior career in defense, supply-chain, technology, and insurance across accounting, IT, finance, and sales; licensed in real estate since May 2012; previously Associate Broker at Group Twenty Six Real Estate and Commercial Agent at Coldwell Banker Realty; now Broker of Record at Azimuth Real Estate and instructor at Azimuth Real Estate Academy and Bergen Community College. Specialty: commercial multifamily investment property and landlord representation in Northern New Jersey.

- A timeline component showing career milestones.

- "Why I teach" pull-quote block (placeholder text for John to fill in).

- Credentials grid: education, licenses, affiliations.

3. BROKERAGE (Azimuth Real Estate)

- Services as cards with icons and 2-sentence descriptions: Landlord Representation (full service), Multifamily Investment Sales, Commercial Leasing, Investment Analysis & Valuation, Property Owner Consulting.

- "How we work" — a 4-step process (Consultation → Analysis → Marketing/Negotiation → Closing).

- Market focus: Northern New Jersey — Hudson, Bergen, Essex, Passaic counties (editable placeholder list).

- "Current Listings" section with placeholder listing cards (address, type, size, price, status), backed by a simple `listings` table in Supabase so it can be turned on later.

- CTA: "Request a Property Consultation" form (name, email, phone, property address, property type, message) that saves to a Supabase `leads` table.

4. ACADEMY (Azimuth Real Estate Academy)

- Intro: founded 2019 in Jersey City to teach real estate the practical way — from the classroom to real deals.

- Courses/Programs grid with placeholder cards (title, format: in-person / online / hybrid, length, price, "Ask About This Course" button). Placeholder programs: "Real Estate Investing Fundamentals," "Commercial & Multifamily Basics," "New Agent Launch Program," "Exam Prep." Mark all as placeholders to be confirmed.

- "Learn on your schedule" section that links to the Video Library, showing the latest 3 videos in the "Lessons" category.

- FAQ accordion with 6 placeholder questions.

- Enrollment interest form (name, email, phone, program of interest, message) saving to the leads table with source = academy.

5. VIDEO LIBRARY (the flagship feature — make this excellent)

Design this like a premium streaming/course platform, not a plain list.

- Page header: "Video Library" with a one-line description and a live video count from the database.

- Featured area at the top: a large featured video card (the most recent is_featured video) with a play button overlay, title, category chip, duration, and date.

- Filter and search bar, sticky below the header on scroll: full-text search across title/description/tags; category tabs (All · Market Updates · Investing · For New Agents · Lessons · Property Tours · Q&A — categories dynamic from the database); sort by Newest / Oldest / Most Popular (increment view_count when a video is played).

- Responsive grid of video cards: 16:9 thumbnail with a duration badge in the corner, hover state that gently scales the thumbnail and shows a play icon, title (2-line clamp), category chip, and relative date ("3 weeks ago"). 3 columns desktop, 2 tablet, 1 mobile. "Load more" pagination in batches of 12.

- Clicking a card opens a video detail route (/videos/:slug) with: a large responsive player (YouTube/Vimeo iframe embed when source_type is youtube/vimeo; native HTML5 video player with custom controls when source_type is upload), title, description with "Read more" expand, tags, a share button (copy link), and an "Up next" row of related videos from the same category. Include prev/next navigation.

- Playlists / Series: add a `playlists` table and a `playlist_videos` join table so John can group videos into ordered series (e.g., "Multifamily 101 — 8 parts"). Show playlists as a horizontal carousel on the library page and give each playlist its own page with an ordered episode list and a "continue watching" indicator using localStorage.

- Polished empty states and skeleton loaders.

- Everything on this page is public — no login required to watch.

6. ADMIN (John's private upload page)

- Route /admin protected by Supabase Auth email + password (single admin user).

- Dashboard listing all videos in a table with thumbnail, title, category, status, views, and edit/delete actions. Drag-and-drop reorder.

- "Add Video" form with two modes: Paste a link (YouTube or Vimeo URL — automatically fetch the title and thumbnail from the oEmbed endpoint and prefill the form) or Upload a file (drag-and-drop MP4/MOV to the Supabase videos bucket with a progress bar, plus a thumbnail upload). Fields: title, description, category (select, with the option to create a new one), tags, playlist assignment, featured toggle, publish date, and Draft/Published status.

- Manage playlists and categories.

- Simple leads inbox showing submissions from the contact, brokerage, and academy forms.

7. CONTACT

- Contact details block (placeholders for phone, email, and the Azimuth Real Estate office address; Academy address: 233 Terrace Ave, Jersey City, NJ 07307 — marked "confirm before launch"), an embedded Google Map placeholder, business hours, and social links.

- General contact form saving to the leads table, with a success toast on submit.

- Calendly embed placeholder for "Book a 15-minute call."

INTERACTION AND POLISH

- Smooth scroll, fade-in-on-scroll for sections, animated counters in the trust strip.

- Accessible: keyboard-navigable video grid, focus states, alt text, sufficient color contrast, captions support on the native player (VTT track slot).

- Loading and error states everywhere data is fetched.

- Toast notifications for form submissions and admin actions.

- A lightweight analytics hook (page views and video plays) stored in Supabase so John can see what people watch.

PLACEHOLDERS TO FLAG

Wrap every placeholder (logo, headshot, testimonials, course details, prices, addresses, license number, sample videos) in a clearly labeled component or comment so they are easy to find and replace once John supplies the real content.

Start by building the full site with all pages and the seeded placeholder videos, then confirm the database schema you created.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e99d9c9-fd8f-44b2-88fb-af8c765961d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
