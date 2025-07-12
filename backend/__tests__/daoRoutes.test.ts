/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import express, { Application } from 'express';

// Ensure the DAO_ID env var is set before importing the router
process.env.SUI_DAO_ID = 'test_dao';

// Mock the SUI client functions
jest.mock('../sui/sui_client', () => ({
  getDaoState: jest.fn(),
  createProposal: jest.fn(),
  startVoting: jest.fn(),
}));
import router from '../sui/sui_api';
import * as suiClient from '../sui/sui_client';

describe('DAO Router', () => {
  let app: Application;
  let io: { emit: jest.Mock<any, any> };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Stub socket.io server
    io = { emit: jest.fn() } as any;
    app.set('io', io);
    app.use(router);

    jest.clearAllMocks();
  });

  describe('GET /state', () => {
    it('returns the DAO state on success', async () => {
      const fakeDao = { proposals: [{ fields: { id: '1', title: 't', description: 'd', votes: [], status: 'open' } }] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const res = await request(app).get('/state');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeDao);
      expect(suiClient.getDaoState).toHaveBeenCalledWith('test_dao');
    });

    it('returns 500 on error', async () => {
      (suiClient.getDaoState as jest.Mock).mockRejectedValue(new Error('failure'));

      const res = await request(app).get('/state');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'failure' });
    });
  });

  describe('POST /proposal', () => {
    it('creates a proposal, responds with digest and broadcasts', async () => {
      (suiClient.createProposal as jest.Mock).mockResolvedValue('digest123');
      const fakeDao = { proposals: [1, 2, 3] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const res = await request(app)
        .post('/proposal')
        .send({ title: 'My Title', description: 'Details' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ digest: 'digest123' });
      expect(suiClient.createProposal).toHaveBeenCalledWith('test_dao', 'My Title', 'Details');
      expect(io.emit).toHaveBeenCalledWith('proposals', fakeDao.proposals);
    });

    it('returns 400 when title or description is missing', async () => {
      const res = await request(app).post('/proposal').send({ title: 'Only Title' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing title or description' });
    });

    it('returns 500 on createProposal error', async () => {
      (suiClient.createProposal as jest.Mock).mockRejectedValue(new Error('fail'));  
      const res = await request(app)
        .post('/proposal')
        .send({ title: 'A', description: 'B' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'fail' });
    });
  });

  describe('POST /vote', () => {
    it('starts voting, responds with digest and broadcasts', async () => {
      (suiClient.startVoting as jest.Mock).mockResolvedValue('digest456');
      const fakeDao = { proposals: ['p1', 'p2'] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const payload = { proposalId: 5, voteCode: 1, sentiment: 42, confidence: 99 };
      const res = await request(app).post('/vote').send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ digest: 'digest456' });
      expect(suiClient.startVoting).toHaveBeenCalledWith('test_dao', 5, 1, 42, 99);
      expect(io.emit).toHaveBeenCalledWith('proposals', fakeDao.proposals);
    });

    it('returns 400 when parameters are invalid', async () => {
      const res = await request(app)
        .post('/vote')
        .send({ proposalId: 'foo', voteCode: 3, sentiment: 'x', confidence: null });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing or invalid vote parameters/);
    });

    it('returns 500 on startVoting error', async () => {
      (suiClient.startVoting as jest.Mock).mockRejectedValue(new Error('oops'));
      const res = await request(app)
        .post('/vote')
        .send({ proposalId: 1, voteCode: 0, sentiment: 0, confidence: 0 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'oops' });
    });
  });
});
