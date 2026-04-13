import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply CORS middleware before all route handlers
app.use(cors({ origin: '*' }));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;