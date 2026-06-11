// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

console.log('🔧 Configuration Passport en cours...');

// ============================================
// STRATÉGIE GOOGLE
// ============================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GOOGLE_CALLBACK_URL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`;
  
  console.log('📌 Google Callback URL:', GOOGLE_CALLBACK_URL);
  console.log('📌 Google Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 30) + '...');
  
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Google profile reçu:', profile.id);
        console.log('📧 Google email:', profile.emails?.[0]?.value);
        console.log('👤 Google name:', profile.displayName);
        
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (!email) {
          console.error('❌ Pas d\'email fourni par Google');
          return done(new Error('Email non fourni par Google'), null);
        }
        
        // Chercher si l'utilisateur existe déjà
        let user = await User.findByEmail(email);
        
        if (!user) {
          // Créer un nouvel utilisateur
          const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          const newUser = {
            name: profile.displayName,
            email: email,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            role: 'customer',
            password: hashedPassword,
            googleId: profile.id,
            emailVerified: true,
            isActive: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          user = await User.create(newUser);
          console.log('✅ Nouvel utilisateur Google créé:', user.email);
        } else {
          console.log('✅ Utilisateur Google existant:', user.email);
          
          // Mettre à jour l'avatar et googleId si nécessaire
          let updated = false;
          if (profile.photos && profile.photos[0] && !user.avatar) {
            await User.update(user.id, { avatar: profile.photos[0].value });
            user.avatar = profile.photos[0].value;
            updated = true;
            console.log('📸 Avatar mis à jour pour:', user.email);
          }
          if (!user.googleId) {
            await User.update(user.id, { googleId: profile.id });
            user.googleId = profile.id;
            updated = true;
            console.log('🔗 Google ID lié pour:', user.email);
          }
          if (updated) {
            user = await User.findById(user.id);
          }
        }
        
        return done(null, user);
      } catch (error) {
        console.error('❌ Erreur GoogleStrategy:', error);
        return done(error, null);
      }
    }
  ));
  console.log('✅ Stratégie Google configurée avec succès');
} else {
  console.warn('⚠️ Google OAuth non configuré (variables manquantes)');
  console.warn('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'défini' : 'manquant');
  console.warn('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'défini' : 'manquant');
}

// ============================================
// STRATÉGIE FACEBOOK
// ============================================
// backend/src/config/passport.js - Partie Facebook corrigée

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  const FACEBOOK_CALLBACK_URL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/facebook/callback`;
  
  console.log('📌 Facebook Callback URL:', FACEBOOK_CALLBACK_URL);
  console.log('📌 Facebook App ID:', process.env.FACEBOOK_APP_ID);
  
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
      passReqToCallback: true,
      enableProof: false  // ← AJOUTER CETTE LIGNE
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Facebook profile reçu:', profile.id);
        console.log('📧 Facebook email:', profile.emails?.[0]?.value);
        console.log('👤 Facebook name:', profile.displayName);
        
        // Récupérer l'email - parfois Facebook ne le donne pas
        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        // Si pas d'email, utiliser un email généré (mais moins sécurisé)
        if (!email) {
          email = `fb_${profile.id}@facebook.com`;
          console.log('⚠️ Pas d\'email, utilisation:', email);
        }
        
        // Chercher si l'utilisateur existe déjà
        let user = await User.findByEmail(email);
        
        if (!user) {
          // Créer un nouvel utilisateur
          const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          const newUser = {
            name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || 'Utilisateur Facebook',
            email: email,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            role: 'customer',
            password: hashedPassword,
            facebookId: profile.id,
            emailVerified: !!profile.emails,
            isActive: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          user = await User.create(newUser);
          console.log('✅ Nouvel utilisateur Facebook créé:', user.email);
        } else {
          console.log('✅ Utilisateur Facebook existant:', user.email);
          
          // Mettre à jour l'avatar et facebookId si nécessaire
          let updated = false;
          if (profile.photos && profile.photos[0] && !user.avatar) {
            await User.update(user.id, { avatar: profile.photos[0].value });
            user.avatar = profile.photos[0].value;
            updated = true;
            console.log('📸 Avatar mis à jour pour:', user.email);
          }
          if (!user.facebookId) {
            await User.update(user.id, { facebookId: profile.id });
            user.facebookId = profile.id;
            updated = true;
            console.log('🔗 Facebook ID lié pour:', user.email);
          }
          if (updated) {
            user = await User.findById(user.id);
          }
        }
        
        return done(null, user);
      } catch (error) {
        console.error('❌ Erreur FacebookStrategy:', error);
        return done(error, null);
      }
    }
  ));
  console.log('✅ Stratégie Facebook configurée avec succès');
} else {
  console.warn('⚠️ Facebook OAuth non configuré (variables manquantes)');
}
// ============================================
// SERIALISATION / DESERIALISATION
// ============================================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('❌ Erreur deserializeUser:', error);
    done(error, null);
  }
});

console.log('✅ Passport configuré avec succès');

module.exports = passport;