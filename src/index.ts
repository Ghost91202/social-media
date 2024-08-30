// src/index.ts
import {app} from './app';
import dotenv from 'dotenv';
import './types';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
