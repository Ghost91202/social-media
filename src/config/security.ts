import cors from 'cors';
import helmet from 'helmet';

export const applySecurityMiddleware = (app: any) => {
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    })
  );
};
