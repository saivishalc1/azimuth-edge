-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- videos
CREATE TYPE public.video_source AS ENUM ('youtube', 'vimeo', 'upload');
CREATE TYPE public.video_status AS ENUM ('draft', 'published');

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'Lessons',
  tags text[] NOT NULL DEFAULT '{}',
  source_type public.video_source NOT NULL DEFAULT 'youtube',
  source_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  status public.video_status NOT NULL DEFAULT 'published',
  is_placeholder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published videos are public" ON public.videos FOR SELECT USING (status = 'published');
CREATE POLICY "Admins read all videos" ON public.videos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- increment view count (public, safe)
CREATE OR REPLACE FUNCTION public.increment_video_views(_video_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.videos SET view_count = view_count + 1 WHERE id = _video_id AND status = 'published';
$$;
GRANT EXECUTE ON FUNCTION public.increment_video_views(uuid) TO anon, authenticated;

-- playlists
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_placeholder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlists are public" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Admins manage playlists" ON public.playlists FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (playlist_id, video_id)
);
GRANT SELECT ON public.playlist_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_videos TO authenticated;
GRANT ALL ON public.playlist_videos TO service_role;
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlist videos are public" ON public.playlist_videos FOR SELECT USING (true);
CREATE POLICY "Admins manage playlist videos" ON public.playlist_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- listings
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  property_type text,
  size text,
  price text,
  status text NOT NULL DEFAULT 'Available',
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_placeholder boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active listings are public" ON public.listings FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage listings" ON public.listings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  property_address text,
  property_type text,
  program text,
  message text,
  source text NOT NULL DEFAULT 'contact',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- analytics
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  path text,
  video_id uuid REFERENCES public.videos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- seed categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Market Updates', 'market-updates', 1),
  ('Investing', 'investing', 2),
  ('For New Agents', 'for-new-agents', 3),
  ('Lessons', 'lessons', 4),
  ('Property Tours', 'property-tours', 5),
  ('Q&A', 'q-and-a', 6);

-- seed placeholder videos
INSERT INTO public.videos (title, slug, description, category, tags, source_type, source_url, thumbnail_url, duration_seconds, published_at, is_featured, sort_order, view_count, is_placeholder) VALUES
  ('[PLACEHOLDER] Northern NJ Multifamily Market Update', 'placeholder-nj-multifamily-market-update', 'PLACEHOLDER VIDEO — replace with real content. A walkthrough of current cap rates, rents and buyer demand across Hudson and Bergen counties.', 'Market Updates', ARRAY['market','multifamily','hudson county'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70', 742, now() - interval '3 days', true, 1, 412, true),
  ('[PLACEHOLDER] How to Analyze a 6-Unit Building', 'placeholder-analyze-a-6-unit-building', 'PLACEHOLDER VIDEO — replace with real content. Underwriting a small multifamily deal line by line, from gross rent to net operating income.', 'Investing', ARRAY['underwriting','noi','analysis'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=70', 1265, now() - interval '9 days', true, 2, 908, true),
  ('[PLACEHOLDER] Your First 90 Days as a New Agent', 'placeholder-first-90-days-new-agent', 'PLACEHOLDER VIDEO — replace with real content. A practical plan for new licensees: prospecting, systems, and picking a niche early.', 'For New Agents', ARRAY['new agents','career'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=70', 980, now() - interval '15 days', true, 3, 1544, true),
  ('[PLACEHOLDER] Cap Rates Explained in 8 Minutes', 'placeholder-cap-rates-explained', 'PLACEHOLDER VIDEO — replace with real content. What a cap rate actually tells you, and the three ways investors misuse it.', 'Lessons', ARRAY['cap rate','fundamentals'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=70', 486, now() - interval '21 days', true, 4, 2210, true),
  ('[PLACEHOLDER] Property Tour: Jersey City Heights 4-Family', 'placeholder-tour-jersey-city-heights', 'PLACEHOLDER VIDEO — replace with real content. Walking a value-add four-family and pointing out what raises and lowers the price.', 'Property Tours', ARRAY['tour','jersey city'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=70', 655, now() - interval '27 days', false, 5, 733, true),
  ('[PLACEHOLDER] Landlord Representation: What Full Service Means', 'placeholder-landlord-representation', 'PLACEHOLDER VIDEO — replace with real content. Leasing, screening, renewals and reporting handled end to end for owners.', 'Lessons', ARRAY['landlord','leasing'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70', 512, now() - interval '34 days', false, 6, 341, true),
  ('[PLACEHOLDER] Q&A: Should I 1031 Exchange or Sell Outright?', 'placeholder-qa-1031-exchange', 'PLACEHOLDER VIDEO — replace with real content. Answering owner questions about timing, taxes and replacement property risk.', 'Q&A', ARRAY['1031','taxes'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=70', 1104, now() - interval '41 days', false, 7, 615, true),
  ('[PLACEHOLDER] Reading a Rent Roll Like a Broker', 'placeholder-reading-a-rent-roll', 'PLACEHOLDER VIDEO — replace with real content. The five red flags that show up in a rent roll before you ever tour a building.', 'Investing', ARRAY['rent roll','due diligence'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70', 878, now() - interval '48 days', false, 8, 489, true),
  ('[PLACEHOLDER] Commercial Leasing Basics for Owners', 'placeholder-commercial-leasing-basics', 'PLACEHOLDER VIDEO — replace with real content. Gross vs. net leases, escalations, and what tenants actually negotiate.', 'Lessons', ARRAY['commercial','leases'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=70', 723, now() - interval '55 days', false, 9, 267, true),
  ('[PLACEHOLDER] Bergen County Market Snapshot', 'placeholder-bergen-county-snapshot', 'PLACEHOLDER VIDEO — replace with real content. Where inventory sits and how owners should think about pricing this quarter.', 'Market Updates', ARRAY['bergen','market'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=70', 604, now() - interval '62 days', false, 10, 198, true),
  ('[PLACEHOLDER] From Engineer to Broker: My Story', 'placeholder-engineer-to-broker', 'PLACEHOLDER VIDEO — replace with real content. Why a math and computer science background turned out to be an advantage in brokerage.', 'For New Agents', ARRAY['story','career'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=70', 1420, now() - interval '70 days', false, 11, 1876, true),
  ('[PLACEHOLDER] Exam Prep: The Math You Actually Need', 'placeholder-exam-prep-math', 'PLACEHOLDER VIDEO — replace with real content. Proration, commission splits and area calculations worked out step by step.', 'Lessons', ARRAY['exam prep','math'], 'youtube', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=70', 1032, now() - interval '80 days', false, 12, 1120, true);

-- seed playlist
INSERT INTO public.playlists (title, slug, description, sort_order, is_placeholder) VALUES
  ('Multifamily 101', 'multifamily-101', 'PLACEHOLDER SERIES — a step-by-step introduction to small multifamily investing in Northern New Jersey.', 1, true),
  ('New Agent Launch', 'new-agent-launch', 'PLACEHOLDER SERIES — the first lessons every newly licensed agent should watch.', 2, true);

INSERT INTO public.playlist_videos (playlist_id, video_id, position)
SELECT p.id, v.id, v.sort_order
FROM public.playlists p, public.videos v
WHERE p.slug = 'multifamily-101' AND v.category IN ('Investing','Lessons');

INSERT INTO public.playlist_videos (playlist_id, video_id, position)
SELECT p.id, v.id, v.sort_order
FROM public.playlists p, public.videos v
WHERE p.slug = 'new-agent-launch' AND v.category IN ('For New Agents','Q&A');

-- seed listings
INSERT INTO public.listings (address, property_type, size, price, status, description, is_placeholder, sort_order) VALUES
  ('[PLACEHOLDER] 000 Central Ave, Jersey City, NJ', 'Mixed-Use', '6,400 SF', '$1,950,000', 'Available', 'PLACEHOLDER LISTING — replace with a real offering. Retail on grade with four apartments above.', true, 1),
  ('[PLACEHOLDER] 000 Bergenline Ave, Union City, NJ', 'Multifamily', '8 Units', '$2,400,000', 'Under Contract', 'PLACEHOLDER LISTING — replace with a real offering. Stabilized eight-family with upside at turnover.', true, 2),
  ('[PLACEHOLDER] 000 Main St, Hackensack, NJ', 'Office', '3,100 SF', '$28/SF NNN', 'For Lease', 'PLACEHOLDER LISTING — replace with a real offering. Second-floor professional suite near the county courthouse.', true, 3);