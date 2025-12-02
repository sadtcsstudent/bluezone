import type { User } from '@prisma/client';

export const formatUser = (user: User | null) => {
  if (!user) return user;
  return {
    ...user,
    interests: user.interests || [],
    preferences: user.preferences ?? null,
  };
};

export const formatUsers = (users: User[]) => users.map((u) => formatUser(u) as User);
