process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const request = require('supertest');
const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User } = require('../models');

describe('PEDIGREE Authentication & RBAC API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('registers a new user and strictly enforces USER role', async () => {
    const testEmail = `testuser_${Date.now()}@pedigree.local`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Candidate',
        email: testEmail,
        password: 'Password@123',
        role: 'ADMIN' // Malicious attempt to register as ADMIN
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    // Verify user role is strictly forced to USER
    expect(res.body.user.role).toBe('USER');

    const dbUser = await User.findOne({ email: testEmail });
    expect(dbUser.role).toBe('USER');
    expect(dbUser.passwordHash).toBeDefined();
  });

  it('rejects registration with missing required fields or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid@pedigree.local',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('authenticates user login and rejects invalid credentials', async () => {
    const resFail = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@pedigree.local',
        password: 'WrongPassword'
      });

    expect(resFail.status).toBe(401);

    const resSuccess = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@pedigree.local',
        password: 'User@123'
      });

    expect(resSuccess.status).toBe(200);
    expect(resSuccess.body.token).toBeDefined();
    expect(resSuccess.body.user.role).toBe('USER');
  });

  it('enforces portal role matching on counselor/admin logins', async () => {
    // Normal user trying to log into counselor portal
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@pedigree.local',
        password: 'User@123',
        requiredRole: 'COUNSELOR'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('reserved for COUNSELOR');
  });

  it('prevents regular users from accessing admin routes', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@pedigree.local',
        password: 'User@123'
      });

    const userToken = loginRes.body.token;

    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(adminRes.status).toBe(403);
  });

  it('allows admin to access admin routes', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@pedigree.local',
        password: 'Admin@123'
      });

    const adminToken = loginRes.body.token;

    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.length).toBeGreaterThan(0);
  });

  it('authenticates all three role demo accounts using @genetrace.local domain', async () => {
    // 1. Client demo account
    const clientRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@genetrace.local',
        password: 'User@123'
      });
    expect(clientRes.status).toBe(200);
    expect(clientRes.body.user.role).toBe('USER');
    expect(clientRes.body.token).toBeDefined();

    // 2. Counselor demo account
    const counselorRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'counselor@genetrace.local',
        password: 'Counselor@123',
        requiredRole: 'COUNSELOR'
      });
    expect(counselorRes.status).toBe(200);
    expect(counselorRes.body.user.role).toBe('COUNSELOR');
    expect(counselorRes.body.token).toBeDefined();

    // 3. Admin demo account
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@genetrace.local',
        password: 'Admin@123',
        requiredRole: 'ADMIN'
      });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.user.role).toBe('ADMIN');
    expect(adminRes.body.token).toBeDefined();
  });

  it('allows counselors to quick-fill a demo case via POST /api/counselor/quick-fill-case', async () => {
    const counselorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'counselor@genetrace.local',
        password: 'Counselor@123',
        requiredRole: 'COUNSELOR'
      });

    const counselorToken = counselorLogin.body.token;

    const quickFillRes = await request(app)
      .post('/api/counselor/quick-fill-case')
      .set('Authorization', `Bearer ${counselorToken}`)
      .send({
        scenarioKey: 'recessive_consanguinity'
      });

    expect(quickFillRes.status).toBe(201);
    expect(quickFillRes.body.success).toBe(true);
    expect(quickFillRes.body.data.familyId).toBeDefined();
    expect(quickFillRes.body.data.assignmentId).toBeDefined();
    expect(quickFillRes.body.data.assessmentCategory).toBeDefined();
  });
});
