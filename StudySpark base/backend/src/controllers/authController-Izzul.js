/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { hasDatabaseConfig, query } from '../config/database.js';

const tokenExpiry = '1d';
const verificationExpiryMs = 24 * 60 * 60 * 1000;
const validAvatarIds = new Set(['blob', 'sprout', 'star', 'zap', 'bookbug']);

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function buildUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: Boolean(row.email_verified),
    avatarId: validAvatarIds.has(row.avatar_id) ? row.avatar_id : 'blob',
    createdAt: row.created_at
  };
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    getJwtSecret(),
    { expiresIn: tokenExpiry }
  );
}


function buildVerificationUrl(token) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${backendUrl}/api/auth/verify-email?token=${token}`;
}

async function sendVerificationEmail({ email, name, verificationUrl }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass: password }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'StudySpark <no-reply@studyspark.local>',
    to: email,
    subject: 'Verify your StudySpark account',
    text: `Hi ${name}, verify your StudySpark account here: ${verificationUrl}`,
    html: `<p>Hi ${name},</p><p>Please verify your StudySpark account.</p><p><a href="${verificationUrl}">Verify email</a></p>`
  });

  return true;
}
function validateAuthSetup(res) {
  if (!hasDatabaseConfig()) {
    res.status(500).json({
      success: false,
      message: 'Database environment variables are missing.'
    });
    return false;
  }

  if (!getJwtSecret()) {
    res.status(500).json({
      success: false,
      message: 'JWT_SECRET is missing from backend environment variables.'
    });
    return false;
  }

  return true;
}

async function registerUser(req, res) {
  if (!validateAuthSetup(res)) {
    return;
  }

  const { name, email, password } = req.body;
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password) {
    res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.'
    });
    return;
  }

  try {
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [trimmedEmail]);

    if (existingUsers.length > 0) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + verificationExpiryMs);
    const result = await query(
      `INSERT INTO users
        (name, email, password_hash, avatar_id, email_verified, verification_token, verification_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [trimmedName, trimmedEmail, passwordHash, 'blob', false, verificationToken, verificationExpiresAt]
    );

    const users = await query(
      'SELECT id, name, email, avatar_id, email_verified, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    const user = buildUser(users[0]);
    const verificationUrl = buildVerificationUrl(verificationToken);
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail({
        email: trimmedEmail,
        name: trimmedName,
        verificationUrl
      });
    } catch (emailError) {
      console.error('Verification email error:', emailError.message);
    }
    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Account created. Check your email to verify your account.'
        : 'Account created. Email delivery is not configured; use the verification link provided for development.',
      verificationRequired: true,
      user,
      ...(process.env.NODE_ENV !== 'production' ? { verificationUrl } : {})
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to register user. Check that MySQL is running and schema.sql has been applied.'
    });
  }
}

async function loginUser(req, res) {
  if (!validateAuthSetup(res)) {
    return;
  }

  const { email, password } = req.body;
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedEmail || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
    return;
  }

  try {
    const users = await query(
      'SELECT id, name, email, password_hash, avatar_id, email_verified, created_at FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const userRow = users[0];
    if (!userRow.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, userRow.password_hash);

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    const user = buildUser(userRow);
    const token = createToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to login. Check that MySQL is running and schema.sql has been applied.'
    });
  }
}

async function getProfile(req, res) {
  if (!validateAuthSetup(res)) {
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Login is required to view profile.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const users = await query(
      'SELECT id, name, email, avatar_id, email_verified, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User profile was not found.'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile loaded successfully.',
      user: buildUser(users[0])
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Your login session has expired. Please login again.'
    });
  }
}

async function updateAvatar(req, res) {
  if (!validateAuthSetup(res)) {
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const avatarId = String(req.body?.avatarId || '').trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Login is required to update profile avatar.'
    });
    return;
  }

  if (!validAvatarIds.has(avatarId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid profile avatar.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    await query('UPDATE users SET avatar_id = ? WHERE id = ?', [avatarId, decoded.id]);

    const users = await query(
      'SELECT id, name, email, avatar_id, email_verified, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User profile was not found.'
      });
      return;
    }

    const user = buildUser(users[0]);

    res.json({
      success: true,
      message: 'Profile avatar updated successfully.',
      user
    });
  } catch {
    res.status(401).json({
      success: false,
      message: 'Your login session has expired. Please login again.'
    });
  }
}


async function sendTestEmail(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.'
    });
  }

  try {
    const sent = await sendVerificationEmail({
      email,
      name: 'StudySpark Tester',
      verificationUrl: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/verify-email?token=test-email-only`
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in backend/.env.'
      });
    }

    return res.json({
      success: true,
      message: 'Test email sent successfully.'
    });
  } catch (error) {
    console.error('Test email error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to send test email. Check your SMTP settings.'
    });
  }
}
async function verifyEmail(req, res) {
  const token = String(req.query.token || '').trim();

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Email verification token is required.'
    });
  }

  try {
    const users = await query(
      'SELECT id FROM users WHERE verification_token = ? AND verification_expires_at > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This verification link is invalid or expired.'
      });
    }

    await query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_expires_at = NULL WHERE id = ?',
      [users[0].id]
    );

    return res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify email right now.'
    });
  }
}

export { getProfile, loginUser, registerUser, sendTestEmail, updateAvatar, verifyEmail };