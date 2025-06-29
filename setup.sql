-- ENUM type for status
DROP TYPE IF EXISTS status_enum CASCADE;

CREATE TYPE status_enum AS ENUM ('public', 'private');

-- USERS
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE
   users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now (),
      last_login TIMESTAMP
   );

-- VERTICALS
DROP TABLE IF EXISTS verticals CASCADE;

CREATE TABLE
   verticals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT NOT NULL UNIQUE,
      label TEXT,
      status status_enum DEFAULT 'public',
      created_by UUID REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );

-- CATEGORIES
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE
   categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE, -- New field
      name TEXT NOT NULL,
      label TEXT,
      status status_enum DEFAULT 'public',
      created_by UUID REFERENCES users (id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now (),
      UNIQUE (vertical_id, name)
   );

-- PRODUCTS (with pricing fields)
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE
   products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT NOT NULL,
      label TEXT,
      status status_enum,
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories (id) ON DELETE CASCADE,
      created_by UUID REFERENCES users (id),
      price NUMERIC(10, 2),
      quantity_per_kg NUMERIC(10, 2),
      sku_id TEXT,
      increment_per_rupee NUMERIC(10, 2),
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );

-- FORMS (for form structure in JSON)
DROP TABLE IF EXISTS forms CASCADE;

CREATE TABLE
   forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      created_by UUID REFERENCES users (id),
      structure JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT now ()
   );

-- BASE FORMS
DROP TABLE IF EXISTS base_forms CASCADE;

CREATE TABLE
   base_forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT NOT NULL,
      label TEXT,
      status status_enum DEFAULT 'private',
      form_id UUID REFERENCES forms (id),
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories (id) ON DELETE CASCADE,
      created_by UUID REFERENCES users (id),
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );

-- DESCRIPTION FORMS
DROP TABLE IF EXISTS description_forms CASCADE;

CREATE TABLE
   description_forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT,
      label TEXT,
      status status_enum DEFAULT 'private',
      form_id UUID REFERENCES forms (id),
      base_form_id UUID REFERENCES base_forms (id) ON DELETE CASCADE,
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories (id) ON DELETE CASCADE,
      created_by UUID REFERENCES users (id),
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );

-- DATA STORE (for storing form data)
DROP TABLE IF EXISTS data_store CASCADE;

CREATE TABLE
   data_store (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      created_by UUID REFERENCES users (id),
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT now ()
   );

-- BASE FORM DATA
DROP TABLE IF EXISTS base_form_data CASCADE;

CREATE TABLE
   base_form_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT,
      label TEXT,
      data_id UUID REFERENCES data_store (id) ON DELETE CASCADE,
      status status_enum DEFAULT 'private',
      base_form_id UUID REFERENCES base_forms (id) ON DELETE CASCADE,
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories (id) ON DELETE CASCADE,
      created_by UUID REFERENCES users (id),
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );

-- DESCRIPTION FORM DATA
DROP TABLE IF EXISTS description_form_data CASCADE;

CREATE TABLE
   description_form_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      name TEXT,
      label TEXT,
      data_id UUID REFERENCES data_store (id) ON DELETE CASCADE,
      status status_enum DEFAULT 'private',
      description_form_id UUID REFERENCES description_forms (id) ON DELETE CASCADE,
      base_form_data_id UUID REFERENCES base_form_data (id) ON DELETE CASCADE,
      vertical_id UUID REFERENCES verticals (id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories (id) ON DELETE CASCADE,
      created_by UUID REFERENCES users (id),
      created_at TIMESTAMP DEFAULT now (),
      updated_at TIMESTAMP DEFAULT now ()
   );