import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { validateNameParam } from '@/middleware/validateNameParams';
import { getGenderFromName } from '@/services/genderiseService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply CORS middleware before all route handlers
app.use(cors({ origin: '*' }));

/**
 * Root health check route.
 */
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Dedicated health check route.
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Name classification endpoint.
 * Validates 'name' query parameter and fetches gender prediction.
 */
app.get('/api/classify', validateNameParam, async (req, res, next) => {
  try {
    const name = req.query.name as string;
    const genderizeResult = await getGenderFromName(name);
    res.status(200).json({ status: 'success', data: genderizeResult });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
});

// Register the global error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;