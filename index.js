import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import { PORT } from './config.js';
import tiresController from './controllers/tires-controller.js';
import sizesController from './controllers/sizes-controller.js';
import searchController from './controllers/search-controller.js';
import usersController from './controllers/users-controller.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'tire-shop-api' });
});

app.use('/tires/manufacturers', tiresController);
app.use('/sizes', sizesController);
app.use('/searchBy', searchController);
app.use('/users', usersController);

app.all('*', (_req, res) => {
  res.status(404).json({ message: 'Resource not found!' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: 'An unexpected error occurred, our developers are working hard to resolve it.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tire Shop API running on port ${PORT}`);
});
