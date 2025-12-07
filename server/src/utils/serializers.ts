import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'> & {
  interests: string[];
  preferences: User['preferences'] | null;
};

export const formatUser = (user: User | null): SafeUser | null => {
  if (!user) return user;
  // Drop sensitive fields like password before exposing the user object.
  // Keep defaults applied for nullable/array fields to simplify consumers.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return {
    ...rest,
    interests: user.interests || [],
    preferences: user.preferences ?? null
  };
};

export const formatUsers = (users: User[]): SafeUser[] => users.map((u) => formatUser(u) as SafeUser);
