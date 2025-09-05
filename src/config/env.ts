import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '8080', 10),
  jwtSecret: process.env.JWT_SECRET || 'secret',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
};
