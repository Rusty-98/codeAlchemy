import { clerk } from '@clerk/express';

const clerkClient = clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default clerkClient;
