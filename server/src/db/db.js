import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../lokiva.sqlite');

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Promise wrappers for async/await
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export async function initDb() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      region TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      state_id INTEGER,
      state_name TEXT NOT NULL,
      state_code TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      image_url TEXT,
      culture_summary TEXT,
      best_time_to_visit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (state_id) REFERENCES states (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      name TEXT NOT NULL,
      character_tag TEXT,
      safety_score REAL DEFAULT 4.5,
      walkability_score REAL DEFAULT 4.0,
      center_lat REAL,
      center_lng REAL,
      FOREIGN KEY (city_id) REFERENCES cities (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      hashed_password TEXT NOT NULL,
      role TEXT DEFAULT 'traveler',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS traveler_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      traveler_type TEXT DEFAULT 'Solo Explorer',
      group_size INTEGER DEFAULT 1,
      budget REAL DEFAULT 1500.0,
      available_hours REAL DEFAULT 8.0,
      interests TEXT DEFAULT '["culture", "food"]',
      accessibility_prefs TEXT DEFAULT '{}',
      current_city TEXT DEFAULT 'Mumbai',
      current_state TEXT DEFAULT 'Maharashtra',
      location_name TEXT DEFAULT 'Hotel',
      hotel_lat REAL DEFAULT 19.076,
      hotel_lng REAL DEFAULT 72.8777,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      business_name TEXT NOT NULL,
      description TEXT,
      contact_email TEXT,
      phone TEXT,
      city TEXT DEFAULT 'Mumbai',
      state TEXT DEFAULT 'Maharashtra',
      address TEXT,
      website TEXT,
      is_verified BOOLEAN DEFAULT 0,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER,
      title TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      cultural_context TEXT,
      state TEXT NOT NULL,
      city TEXT NOT NULL,
      area_name TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      approx_duration_mins INTEGER DEFAULT 120,
      price REAL DEFAULT 500.0,
      currency TEXT DEFAULT 'INR',
      max_capacity INTEGER DEFAULT 10,
      difficulty_level TEXT DEFAULT 'easy',
      is_indoor BOOLEAN DEFAULT 0,
      is_rain_safe BOOLEAN DEFAULT 1,
      is_hidden_gem BOOLEAN DEFAULT 0,
      is_family_friendly BOOLEAN DEFAULT 1,
      low_walking BOOLEAN DEFAULT 0,
      wheelchair_accessible BOOLEAN DEFAULT 0,
      best_time_of_day TEXT DEFAULT 'morning',
      rating REAL,
      review_count INTEGER DEFAULT 0,
      notability_score REAL,
      osm_id TEXT,
      osm_type TEXT,
      otm_xid TEXT,
      wikidata_id TEXT,
      source TEXT DEFAULT 'curated',
      raw_osm_tags TEXT,
      image_urls TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    )
  `);

  // Cached geographical bounding boxes for Overpass query results
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cached_regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_lat REAL NOT NULL,
      min_lng REAL NOT NULL,
      max_lat REAL NOT NULL,
      max_lng REAL NOT NULL,
      center_lat REAL NOT NULL,
      center_lng REAL NOT NULL,
      display_name TEXT NOT NULL,
      place_count INTEGER DEFAULT 0,
      last_fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      source TEXT DEFAULT 'nominatim_overpass'
    )
  `);

  // Ingestion run audit logs
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ingestion_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_input TEXT,
      resolved_location TEXT,
      status TEXT NOT NULL,
      places_found INTEGER DEFAULT 0,
      places_persisted INTEGER DEFAULT 0,
      places_enriched INTEGER DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Dynamic OpenStreetMap administrative boundary queue for pan-India background seeding
  await dbRun(`
    CREATE TABLE IF NOT EXISTS admin_boundaries_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      osm_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      admin_level INTEGER NOT NULL,
      state_name TEXT,
      min_lat REAL,
      min_lng REAL,
      max_lat REAL,
      max_lng REAL,
      center_lat REAL,
      center_lng REAL,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 10,
      places_ingested INTEGER DEFAULT 0,
      last_attempt_at DATETIME,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      target_date TEXT,
      total_duration_mins INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0.0,
      feasibility_score REAL DEFAULT 90.0,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itinerary_id INTEGER NOT NULL,
      experience_id INTEGER NOT NULL,
      item_order INTEGER NOT NULL,
      start_time TEXT,
      end_time TEXT,
      travel_time_to_next_mins INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (itinerary_id) REFERENCES itineraries (id),
      FOREIGN KEY (experience_id) REFERENCES experiences (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      user_id INTEGER,
      rating REAL NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (experience_id) REFERENCES experiences (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      experience_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (experience_id) REFERENCES experiences (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS provider_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      bookings INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0.0,
      avg_rating REAL DEFAULT 4.8,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS pexels_image_cache (
      query TEXT PRIMARY KEY,
      photo_url TEXT NOT NULL,
      photo_urls TEXT,
      photographer TEXT,
      photographer_url TEXT,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safe migration check for new columns on existing database
  try {
    const tableInfo = await dbAll("PRAGMA table_info(experiences)");
    const cols = tableInfo.map((c) => c.name);
    if (!cols.includes('osm_id')) await dbRun("ALTER TABLE experiences ADD COLUMN osm_id TEXT");
    if (!cols.includes('osm_type')) await dbRun("ALTER TABLE experiences ADD COLUMN osm_type TEXT");
    if (!cols.includes('otm_xid')) await dbRun("ALTER TABLE experiences ADD COLUMN otm_xid TEXT");
    if (!cols.includes('wikidata_id')) await dbRun("ALTER TABLE experiences ADD COLUMN wikidata_id TEXT");
    if (!cols.includes('notability_score')) await dbRun("ALTER TABLE experiences ADD COLUMN notability_score REAL");
    if (!cols.includes('source')) await dbRun("ALTER TABLE experiences ADD COLUMN source TEXT DEFAULT 'curated'");
    if (!cols.includes('raw_osm_tags')) await dbRun("ALTER TABLE experiences ADD COLUMN raw_osm_tags TEXT");
  } catch (err) {
    console.log('Migration note:', err.message);
  }

  console.log('Database tables and ingestion schema initialized successfully.');
}
