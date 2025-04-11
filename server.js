const express = require('express');
const pointsRoutes = require('./routes/spatials');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/points', pointsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
