const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server.js');
const User = require('../models/user.model.js');
const Referral = require('../models/referral.model.js');
const generateToken = require('../utils/generateToken.js');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterEach(async () => {
    await User.deleteMany();
    await Referral.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Authentication API Tests', () => {

    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!'
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with existing email', async () => {
        await new User({ username: 'testuser', email: 'test@example.com', password: 'Password123!' }).save();

        const res = await request(app).post('/api/register').send({
            username: 'user2',
            email: 'test@example.com',
            password: 'Password123!'
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should not register with invalid input', async () => {
        const res = await request(app).post('/api/register').send({
            username: 'us', 
            email: 'invalid-email',
            password: '123'
        });

        expect(res.status).toBe(400);
    });

    it('should log in a user with valid credentials', async () => {
        await new User({ username: 'testuser', email: 'test@example.com', password: 'Password123!' }).save();

        const res = await request(app).post('/api/login').send({
            email: 'test@example.com',
            password: 'Password123!'
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not log in a user with incorrect credentials', async () => {
        const res = await request(app).post('/api/login').send({
            email: 'test@example.com',
            password: 'WrongPassword!'
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('should generate a password reset token', async () => {
        await new User({ username: 'testuser', email: 'test@example.com', password: 'Password123!' }).save();

        const res = await request(app).post('/api/forgot-password').send({
            email: 'test@example.com'
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('resetToken');
    });

    it('should return an error for non-existent email in forgot-password', async () => {
        const res = await request(app).post('/api/forgot-password').send({
            email: 'nonexistent@example.com'
        });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });
});

describe('Referral API Tests', () => {
    let user, token;

    beforeEach(async () => {
        user = await new User({ username: 'testuser', email: 'test@example.com', password: 'Password123!' }).save();
        token = generateToken(user._id);
    });

    it('should get referrals for a logged-in user', async () => {
        const referredUser = await new User({ username: 'referredUser', email: 'referred@example.com', password: 'Password123!' }).save();

        await Referral.create({ referrerId: user._id, referredUserId: referredUser._id, status: 'successful' });

        const res = await request(app)
            .get('/api/referrals')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('referredUserId');
    });

    it('should get referral statistics', async () => {
        const referredUser1 = await new User({ username: 'user1', email: 'user1@example.com', password: 'Password123!' }).save();
        const referredUser2 = await new User({ username: 'user2', email: 'user2@example.com', password: 'Password123!' }).save();

        await Referral.create({ referrerId: user._id, referredUserId: referredUser1._id, status: 'successful' });
        await Referral.create({ referrerId: user._id, referredUserId: referredUser2._id, status: 'pending' });

        const res = await request(app)
            .get('/api/referral-stats')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: 'successful', count: 1 }),
                expect.objectContaining({ _id: 'pending', count: 1 })
            ])
        );
    });

    it('should return 401 if user is not authenticated', async () => {
        const res = await request(app).get('/api/referrals');
        expect(res.status).toBe(401);
    });
});
