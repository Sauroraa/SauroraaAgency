import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

async function seed() {
  const ds = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'sauroraa',
    password: process.env.DB_PASSWORD || 'sauroraa_secret_2026',
    database: process.env.DB_NAME || 'sauroraa',
  });

  await ds.initialize();

  // Seed admin user
  const adminId = uuidv4();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026!', 12);

  await ds.query(
    `INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role, is_active)
     VALUES (?, ?, ?, ?, ?, 'admin', true)`,
    [adminId, process.env.ADMIN_EMAIL || 'admin@sauroraa.be', passwordHash, 'Admin', 'Sauroraa'],
  );

  // Seed demo artists
  const artists = [
    { name: 'AEDEN', country: 'BEL', city: 'Brussels', bio: 'Belgian techno sensation pushing boundaries of melodic techno.', genres: [1, 6], popularity: 85, fee: [3000, 6000] },
    { name: 'NØVA', country: 'FRA', city: 'Paris', bio: 'French deep house prodigy with ethereal soundscapes.', genres: [4, 9], popularity: 72, fee: [2000, 4500] },
    { name: 'KODA', country: 'DEU', city: 'Berlin', bio: 'Berlin-based minimal master with razor-sharp precision.', genres: [3, 1], popularity: 90, fee: [5000, 10000] },
    { name: 'LYRA', country: 'NLD', city: 'Amsterdam', bio: 'Dutch tech house queen dominating festival stages worldwide.', genres: [5, 2], popularity: 88, fee: [4000, 8000] },
    { name: 'ZENITH', country: 'GBR', city: 'London', bio: 'UK drum & bass pioneer redefining the genre boundaries.', genres: [10, 13], popularity: 78, fee: [3500, 7000] },
    { name: 'AURORA WAVES', country: 'BEL', city: 'Antwerp', bio: 'Ambient electronic duo crafting immersive audio experiences.', genres: [12, 13], popularity: 65, fee: [1500, 3000] },
    { name: 'DARKMODE', country: 'ESP', city: 'Barcelona', bio: 'Hard techno warrior from Barcelona underground scene.', genres: [7, 1], popularity: 82, fee: [2500, 5000] },
    { name: 'SOLACE', country: 'ITA', city: 'Milan', bio: 'Italian progressive house maestro with cinematic productions.', genres: [9, 2], popularity: 70, fee: [2000, 4000] },
  ];

  for (const a of artists) {
    const artistId = uuidv4();
    const slug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');

    await ds.query(
      `INSERT IGNORE INTO artists (id, slug, name, country, city, bio_short, bio_full, availability, popularity_score, base_fee_min, base_fee_max, is_curated)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available', ?, ?, ?, true)`,
      [artistId, slug, a.name, a.country, a.city, a.bio, a.bio, a.popularity, a.fee[0], a.fee[1]],
    );

    for (const genreId of a.genres) {
      await ds.query(
        `INSERT IGNORE INTO artist_genres (artist_id, genre_id) VALUES (?, ?)`,
        [artistId, genreId],
      );
    }
  }

  console.log('Seeding complete!');
  await ds.destroy();
}

seed().catch(console.error);
