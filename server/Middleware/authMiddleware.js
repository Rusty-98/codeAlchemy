import { clerkClient } from '@clerk/express';

const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.clerkUser = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: ' + error.message });
  }
};

export default authMiddleware;
