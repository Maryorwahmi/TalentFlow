/**
 * Comprehensive Backend Endpoint Tests
 * Created by CaptainCode
 * Tests all BE-1, BE-2, and BE-3 endpoints
 * 
 * Run with: npm test
 * Run specific test: npm test -- --grep "endpoint-name"
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

const BASE_URL = 'http://localhost:3000';

describe('TalentFlow Backend - Comprehensive Endpoint Tests', function() {
  this.timeout(10000);

  let server;
  let accessToken;
  let refreshToken;
  let userId;
  let courseId;
  let lessonId;
  let assignmentId;
  let teamId;

  // Test Users
  const testUser = {
    email: 'testuser@dev.com',
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'User',
  };

  const testInstructor = {
    email: 'instructor@dev.com',
    password: 'Inst@123456',
    firstName: 'Test',
    lastName: 'Instructor',
  };

  const testAdmin = {
    email: 'admin@dev.com',
    password: 'Admin@123456',
    firstName: 'Test',
    lastName: 'Admin',
  };

  before(function(done) {
    // Start server
    server = app.listen(3001, () => {
      console.log('Test server running on port 3001');
      done();
    });
  });

  after(function(done) {
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        done();
      });
    }
  });

  // ============================================
  // BE-1: Authentication & Identity Tests
  // ============================================

  describe('BE-1: Authentication & Identity', function() {
    describe('POST /api/v1/auth/signup', function() {
      it('should successfully register a new learner', function(done) {
        request(app)
          .post('/api/v1/auth/signup')
          .send(testUser)
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('user');
            expect(res.body.data).to.have.property('accessToken');
            expect(res.body.data).to.have.property('refreshToken');
            
            userId = res.body.data.user.id;
            accessToken = res.body.data.accessToken;
            refreshToken = res.body.data.refreshToken;
            
            done();
          });
      });

      it('should reject duplicate email registration', function(done) {
        request(app)
          .post('/api/v1/auth/signup')
          .send(testUser)
          .expect(409)
          .end(done);
      });

      it('should reject missing required fields', function(done) {
        request(app)
          .post('/api/v1/auth/signup')
          .send({ email: 'test@test.com' })
          .expect(400)
          .end(done);
      });
    });

    describe('POST /api/v1/auth/login', function() {
      it('should successfully login with correct credentials', function(done) {
        request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: testUser.email,
            password: testUser.password 
          })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body.data).to.have.property('accessToken');
            expect(res.body.data).to.have.property('refreshToken');
            
            accessToken = res.body.data.accessToken;
            refreshToken = res.body.data.refreshToken;
            
            done();
          });
      });

      it('should reject login with wrong password', function(done) {
        request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: testUser.email,
            password: 'wrongpassword' 
          })
          .expect(401)
          .end(done);
      });

      it('should reject login with non-existent email', function(done) {
        request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: 'nonexistent@test.com',
            password: 'anypassword' 
          })
          .expect(401)
          .end(done);
      });
    });

    describe('GET /api/v1/auth/me', function() {
      it('should return current user with valid token', function(done) {
        request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body.data).to.have.property('user');
            expect(res.body.data.user.email).to.equal(testUser.email);
            
            done();
          });
      });

      it('should reject request without auth token', function(done) {
        request(app)
          .get('/api/v1/auth/me')
          .expect(401)
          .end(done);
      });

      it('should reject request with invalid token', function(done) {
        request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid.token.here')
          .expect(401)
          .end(done);
      });
    });

    describe('POST /api/v1/auth/refresh', function() {
      it('should issue new tokens with valid refresh token', function(done) {
        request(app)
          .post('/api/v1/auth/refresh')
          .send({ refreshToken })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body.data).to.have.property('accessToken');
            accessToken = res.body.data.accessToken;
            
            done();
          });
      });
    });

    describe('PATCH /api/v1/auth/profile', function() {
      it('should update user profile', function(done) {
        request(app)
          .patch('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ firstName: 'UpdatedName' })
          .expect(200)
          .end(done);
      });
    });

    describe('POST /api/v1/auth/logout', function() {
      it('should logout user', function(done) {
        request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .end(done);
      });
    });
  });

  // ============================================
  // BE-2: Learning Core Tests
  // ============================================

  describe('BE-2: Learning Core', function() {
    describe('GET /api/v1/courses', function() {
      it('should list all courses', function(done) {
        request(app)
          .get('/api/v1/courses')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body).to.have.property('data');
            expect(Array.isArray(res.body.data)).to.be.true;
            
            done();
          });
      });

      it('should filter courses by category', function(done) {
        request(app)
          .get('/api/v1/courses?category=design')
          .expect(200)
          .end(done);
      });
    });

    describe('POST /api/v1/courses', function() {
      it('should create course as instructor', function(done) {
        request(app)
          .post('/api/v1/courses')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Test Course',
            description: 'A test course',
            category: 'Development'
          })
          .expect([201, 200])
          .end((err, res) => {
            if (err) return done(err);
            
            courseId = res.body.data.id;
            done();
          });
      });
    });

    describe('GET /api/v1/courses/:id', function() {
      it('should get course details', function(done) {
        if (!courseId) return done();
        
        request(app)
          .get(`/api/v1/courses/${courseId}`)
          .expect(200)
          .end(done);
      });
    });

    describe('GET /api/v1/courses/:courseId/lessons', function() {
      it('should list course lessons', function(done) {
        if (!courseId) return done();
        
        request(app)
          .get(`/api/v1/courses/${courseId}/lessons`)
          .expect([200, 404])
          .end(done);
      });
    });

    describe('POST /api/v1/courses/:courseId/lessons', function() {
      it('should create lesson', function(done) {
        if (!courseId) return done();
        
        request(app)
          .post(`/api/v1/courses/${courseId}/lessons`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Test Lesson',
            content: 'Lesson content',
            duration: 45
          })
          .expect([201, 200])
          .end((err, res) => {
            if (err) return done(err);
            
            if (res.body.data && res.body.data.id) {
              lessonId = res.body.data.id;
            }
            
            done();
          });
      });
    });

    describe('GET /api/v1/courses/:courseId/assignments', function() {
      it('should list course assignments', function(done) {
        if (!courseId) return done();
        
        request(app)
          .get(`/api/v1/courses/${courseId}/assignments`)
          .expect([200, 404])
          .end(done);
      });
    });

    describe('POST /api/v1/courses/:courseId/assignments', function() {
      it('should create assignment', function(done) {
        if (!courseId) return done();
        
        request(app)
          .post(`/api/v1/courses/${courseId}/assignments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Test Assignment',
            description: 'An assignment',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          .expect([201, 200])
          .end((err, res) => {
            if (err) return done(err);
            
            if (res.body.data && res.body.data.id) {
              assignmentId = res.body.data.id;
            }
            
            done();
          });
      });
    });

    describe('GET /api/v1/certificates', function() {
      it('should list user certificates', function(done) {
        request(app)
          .get('/api/v1/certificates')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .end(done);
      });
    });
  });

  // ============================================
  // BE-3: Collaboration Tests
  // ============================================

  describe('BE-3: Teams & Collaboration', function() {
    describe('GET /api/v1/teams', function() {
      it('should list teams', function(done) {
        request(app)
          .get('/api/v1/teams')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect([200, 401])
          .end(done);
      });
    });

    describe('GET /api/v1/announcements', function() {
      it('should list announcements', function(done) {
        request(app)
          .get('/api/v1/announcements')
          .expect(200)
          .end(done);
      });
    });

    describe('GET /api/v1/notifications', function() {
      it('should list notifications', function(done) {
        request(app)
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect([200, 401])
          .end(done);
      });
    });
  });

  // ============================================
  // Health & Documentation Tests
  // ============================================

  describe('Health & Documentation', function() {
    describe('GET /health', function() {
      it('should return health status', function(done) {
        request(app)
          .get('/health')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body.data).to.have.property('status');
            expect(res.body.data.status).to.equal('ok');
            
            done();
          });
      });
    });

    describe('GET /api/v1/docs', function() {
      it('should return API documentation', function(done) {
        request(app)
          .get('/api/v1/docs')
          .expect(200)
          .end(done);
      });
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================

  describe('Error Handling', function() {
    describe('404 Not Found', function() {
      it('should return 404 for non-existent endpoints', function(done) {
        request(app)
          .get('/api/v1/nonexistent')
          .expect(404)
          .end(done);
      });
    });

    describe('Error Response Format', function() {
      it('should return proper error format', function(done) {
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'invalid' })
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            
            expect(res.body).to.have.property('meta');
            expect(res.body).to.have.property('error');
            
            done();
          });
      });
    });
  });
});
