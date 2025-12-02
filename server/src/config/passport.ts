import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { config } from './index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../services/auth.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: '/api/auth/google/callback'
    },
    async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email not provided by Google'));

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || 'Google User',
              password: await hashPassword(Math.random().toString(36).slice(2)),
              authProvider: 'google',
              googleId: profile.id
            }
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id, authProvider: 'google' } });
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: config.oauth.facebook.appId,
      clientSecret: config.oauth.facebook.appSecret,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName']
    },
    async (_accessToken: string, _refreshToken: string, profile: FacebookProfile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email not provided by Facebook'));

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() || 'Facebook User',
              password: await hashPassword(Math.random().toString(36).slice(2)),
              authProvider: 'facebook',
              facebookId: profile.id
            }
          });
        } else if (!user.facebookId) {
          user = await prisma.user.update({ where: { id: user.id }, data: { facebookId: profile.id, authProvider: 'facebook' } });
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, (user as any).id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error as Error);
  }
});

export default passport;
