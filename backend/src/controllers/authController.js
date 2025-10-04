import { supabase } from '../config/supabase.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { validateEmail, validatePassword, validateRequired, sanitizeString } from '../utils/validation.js';

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    validateRequired(email, 'Email');
    validateRequired(password, 'Password');
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        username: username ? sanitizeString(username, 100) : null
      })
      .select('id, email, username, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email, passwordLength: req.body.password?.length });
    
    const { email, password } = req.body;

    // Validation
    validateRequired(email, 'Email');
    validateRequired(password, 'Password');

    if (!validateEmail(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get user
    console.log('🔍 Looking up user:', email.toLowerCase());
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, password_hash, is_admin')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      console.log('❌ User not found or error:', error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', { id: user.id, email: user.email, is_admin: user.is_admin });

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified for user:', user.email);

    // Generate token
    const token = generateToken(user.id);
    console.log('🎫 Token generated for user:', user.email);

    const response = {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin
      },
      token
    };

    console.log('✅ Login successful, sending response:', { 
      userId: user.id, 
      email: user.email, 
      is_admin: user.is_admin,
      tokenLength: token.length 
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};

    if (username !== undefined) {
      updates.username = sanitizeString(username, 100);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, username, updated_at')
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
