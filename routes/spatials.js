const express = require('express');
const router = express.Router();
const db = require('../database');

// Add spatial
router.post('/add', async (req, res) => {
  const { name, description, lat, long, state, city, pincode } = req.body;

  try {
    console.log('Body received:', req.body);

    const result = await db.query(
      `INSERT INTO spatials.spatialdata (name, description, lat, long, state, city, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, lat, long, state, city, pincode]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding point:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
  

// Fetch all
router.get('/getall', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, description, lat AS latitude, long AS longitude
       FROM spatials.spatialdata
       WHERE deleted = FALSE`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching points:', err.message);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

// Update point by ID
router.put('/update/:id', async (req, res) => {
  const { name, description, lat, long, state, city, pincode } = req.body;
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE spatials.spatialdata
       SET name = $1,
           description = $2,
           lat = $3,
           long = $4,
           state = $5,
           city = $6,
           pincode = $7
       WHERE id = $8 AND deleted = FALSE
       RETURNING *`,
      [name, description, lat, long, state, city, pincode, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Point not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating point:', err.message);
    res.status(500).json({ error: 'Failed to update point' });
  }
});
  

// Get points in a radius
router.get('/nearby', async (req, res) => {
  const { lat, long, radius } = req.query;

  if (!lat || !long || !radius) {
    return res.status(400).json({ error: 'lat, long, and radius are required query params' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM (
         SELECT *,
           (6371 * acos(
             cos(radians($1)) * cos(radians(lat)) *
             cos(radians(long) - radians($2)) +
             sin(radians($1)) * sin(radians(lat))
           )) AS distance_km
         FROM spatials.spatialdata
         WHERE deleted = FALSE
       ) AS subquery
       WHERE distance_km < $3
       ORDER BY distance_km`,
      [parseFloat(lat), parseFloat(long), parseFloat(radius)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching nearby points:', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby points' });
  }
});
  

//Get distance between points
router.get('/distance', async (req, res) => {
    const { lat1, long1, lat2, long2 } = req.query;
  
    if (!lat1 || !long1 || !lat2 || !long2) {
      return res.status(400).json({ error: 'lat1, long1, lat2, and long2 are required query params' });
    }
  
    try {
      const result = await db.query(
        `SELECT (
           6371 * acos(
             cos(radians($1)) * cos(radians($3)) *
             cos(radians($4) - radians($2)) +
             sin(radians($1)) * sin(radians($3))
           )
         ) AS distance_km`,
        [
          parseFloat(lat1),
          parseFloat(long1),
          parseFloat(lat2),
          parseFloat(long2)
        ]
      );
  
      res.json({ distance_km: result.rows[0].distance_km });
    } catch (err) {
      console.error('Error calculating distance:', err.message);
      res.status(500).json({ error: 'Failed to calculate distance' });
    }
  });
  
  
  
module.exports = router;
