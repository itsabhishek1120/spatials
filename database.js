const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:3pgScGtR9ZzQ@ep-aged-resonance-a102ss61-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

module.exports = pool;