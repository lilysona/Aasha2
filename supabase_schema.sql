-- Clean rebuild: drop existing objects before re-creating (safe for this app schema)
-- NOTE: This will remove data in these tables. Run only if you intend to rebuild.
DROP TABLE IF EXISTS family_news CASCADE;
DROP TABLE IF EXISTS medication_adherence CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS staged_onboarding_submissions CASCADE;

DROP TYPE IF EXISTS mood_type CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS topics_tone_type CASCADE;
DROP TYPE IF EXISTS call_slot_type CASCADE;
DROP TYPE IF EXISTS app_audience CASCADE;

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for 'audience' and 'topics_tone'
CREATE TYPE app_audience AS ENUM ('elder', 'family', 'marketing');
CREATE TYPE call_slot_type AS ENUM ('morning', 'afternoon', 'evening', 'custom', '');
CREATE TYPE topics_tone_type AS ENUM ('Warm', 'Formal', 'Playful');


-- Table: profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL, -- Storing countryCode + number
    audience app_audience NOT NULL DEFAULT 'marketing',
    topics_tone topics_tone_type NOT NULL DEFAULT 'Warm',
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    location TEXT,
    marital_status TEXT,
    preferred_name TEXT,
    language TEXT DEFAULT 'English',
    reading_time TEXT,
    calling_time TEXT,
    call_slot call_slot_type DEFAULT '',
    custom_from TEXT,
    custom_to TEXT,
    interests TEXT[], -- Array of strings
    care_goals TEXT[], -- Array of strings
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete their own profile."
  ON profiles FOR DELETE
  USING (auth.uid() = auth_user_id);


-- Table: medications
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    morning BOOLEAN DEFAULT FALSE,
    afternoon BOOLEAN DEFAULT FALSE,
    evening BOOLEAN DEFAULT FALSE,
    night BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for medications table
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medications are viewable by their owner."
  ON medications FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own medications."
  ON medications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own medications."
  ON medications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own medications."
  ON medications FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));


-- Table: emergency_contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for emergency_contacts table
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emergency contacts are viewable by their owner."
  ON emergency_contacts FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own emergency contacts."
  ON emergency_contacts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own emergency contacts."
  ON emergency_contacts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own emergency contacts."
  ON emergency_contacts FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));


-- Table: family_members
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The family member who manages this loved one
    elder_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable: if the elder also has an app profile
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    relationship TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for family_members table
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members are viewable by the managing family profile."
  ON family_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Family users can insert their own loved ones."
  ON family_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Family users can update their own loved ones."
  ON family_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Family users can delete their own loved ones."
  ON family_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));


-- Table: notification_preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    missed_dose BOOLEAN DEFAULT TRUE,
    no_chat BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for notification_preferences table
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification preferences are viewable by their owner."
  ON notification_preferences FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own notification preferences."
  ON notification_preferences FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own notification preferences."
  ON notification_preferences FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own notification preferences."
  ON notification_preferences FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));


-- Create ENUM for mood type
CREATE TYPE mood_type AS ENUM ('happy', 'neutral', 'sad', 'unknown');

-- Create ENUM for alert type
CREATE TYPE alert_type AS ENUM ('missedDose', 'noChat', 'refill', 'other');


-- Table: conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT,
    summary TEXT,
    full_text TEXT,
    mood mood_type DEFAULT 'unknown',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversations are viewable by their owner."
  ON conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own conversations."
  ON conversations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own conversations."
  ON conversations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own conversations."
  ON conversations FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));


-- Table: alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The profile this alert is for (e.g., the elder)
    family_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The family member who should receive the alert
    type alert_type NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for alerts table
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alerts are viewable by the elder and their family."
  ON alerts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid())
  );

CREATE POLICY "Users can insert alerts for their profiles and loved ones."
  ON alerts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own alerts."
  ON alerts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own alerts."
  ON alerts FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));


-- Table: medication_adherence
CREATE TABLE medication_adherence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- e.g., 'morning', 'afternoon', 'evening', 'night'
    is_taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (profile_id, medication_id, date, time_slot)
);

-- RLS for medication_adherence table
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adherence is viewable by owner and family."
  ON medication_adherence FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN profiles p ON p.id = fm.elder_profile_id
      WHERE p.id = profile_id AND fm.family_profile_id IN (SELECT id FROM profiles fp WHERE fp.auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own adherence records."
  ON medication_adherence FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own adherence records."
  ON medication_adherence FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own adherence records."
  ON medication_adherence FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid()));


-- Table: family_news
CREATE TABLE family_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The family member who posted the news
    elder_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The loved one for whom the news is intended
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for family_news table
ALTER TABLE family_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family news is viewable by elder and posting family."
  ON family_news FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = elder_profile_id AND p.auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid())
  );

CREATE POLICY "Family members can post news for their loved ones."
  ON family_news FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Family members can update their own news posts."
  ON family_news FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));

CREATE POLICY "Family members can delete their own news posts."
  ON family_news FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = family_profile_id AND p.auth_user_id = auth.uid()));


-- Dev-only: staged submissions when auth user is not available (OTP bypass)
CREATE TABLE IF NOT EXISTS staged_onboarding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT,
    audience TEXT,
    loved_one_phone TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staged_onboarding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staged insert" ON staged_onboarding_submissions;
CREATE POLICY "staged insert"
  ON staged_onboarding_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "staged select" ON staged_onboarding_submissions;
CREATE POLICY "staged select"
  ON staged_onboarding_submissions FOR SELECT
  USING (true);
