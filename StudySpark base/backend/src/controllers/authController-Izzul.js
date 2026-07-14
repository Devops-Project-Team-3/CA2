/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hasDatabaseConfig, query } from '../config/database.js';

const tokenExpiry = '1d';
const validAvatarIds = new Set(['blob', 'sprout', 'star', 'zap', 'bookbug']);

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function buildUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
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
    const result = await query(
      'INSERT INTO users (name, email, password_hash, avatar_id) VALUES (?, ?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash, 'blob']
    );

    const users = await query(
      'SELECT id, name, email, avatar_id, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    const user = buildUser(users[0]);
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
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
      'SELECT id, name, email, password_hash, avatar_id, created_at FROM users WHERE email = ?',
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
      'SELECT id, name, email, avatar_id, created_at FROM users WHERE id = ?',
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
      'SELECT id, name, email, avatar_id, created_at FROM users WHERE id = ?',
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

export { getProfile, loginUser, registerUser, updateAvatar };
