process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const request = require('supertest');
const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { Assessment, User } = require('../models');

describe('PEDIGREE PDF Report Generation', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('generates and streams a valid PDF report for an assessment', async () => {
    // 1. Authenticate as demo user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@pedigree.local',
        password: 'User@123'
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    const userId = loginRes.body.user._id;

    // 2. Fetch assessment owned by this user
    let assessment = await Assessment.findOne({ userId });
    if (!assessment) {
      assessment = await Assessment.findOne();
    }
    expect(assessment).toBeDefined();

    // 3. Request PDF report stream
    const reportRes = await request(app)
      .get(`/api/reports/assessment/${assessment._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(reportRes.status).toBe(200);
    expect(reportRes.headers['content-type']).toBe('application/pdf');
    expect(reportRes.headers['content-disposition']).toContain('pedigree-assessment');
    // Verify standard PDF header '%PDF-'
    expect(reportRes.body.slice(0, 4).toString()).toBe('%PDF');
  });
});
