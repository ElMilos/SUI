import express from 'express';
import request from 'supertest';
import { Server } from 'socket.io';
process.env.SUI_DAO_ID = 'test-dao-id';

jest.mock('../sui/sui_client', () => ({
  getDaoState: jest.fn(),
  createProposal: jest.fn(),
  voteOnProposal: jest.fn(),
  DAO_ID: 'test-dao-id',
}));
import * as suiClient from '../sui/sui_client';
import daoRoutes from '../sui/sui_api';

describe('DAO API Routes', () => {
  let app: express.Express;
  let mockIo: Partial<Server>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockIo = { emit: jest.fn() };
    app.set('io', mockIo);
    app.use('/dao', daoRoutes);

    jest.clearAllMocks();
  });

  describe('GET /dao/state', () => {
    it('should return DAO state on success', async () => {
      const fakeDao = { proposals: [{ id: 1, title: 'Test' }] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const res = await request(app).get('/dao/state');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeDao);
      expect(suiClient.getDaoState).toHaveBeenCalledWith('test-dao-id');
    });

    it('should return 500 on error', async () => {
      (suiClient.getDaoState as jest.Mock).mockRejectedValue(new Error('Failed'));

      const res = await request(app).get('/dao/state');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed' });
    });
  });

  describe('POST /dao/proposal', () => {
    const validProposal = { title: 'New', description: 'Desc' };

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/dao/proposal').send({ title: 'Only Title' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing title or description' });
    });

    it('should create a proposal and broadcast', async () => {
      (suiClient.createProposal as jest.Mock).mockResolvedValue('digest123');
      const fakeDao = { proposals: [] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const res = await request(app).post('/dao/proposal').send(validProposal);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ digest: 'digest123' });
      expect(suiClient.createProposal).toHaveBeenCalledWith('test-dao-id', 'New', 'Desc');
      expect(mockIo!.emit).toHaveBeenCalledWith('proposals', fakeDao.proposals);
    });

    it('should return 500 on create error', async () => {
      (suiClient.createProposal as jest.Mock).mockRejectedValue(new Error('Create failed'));

      const res = await request(app).post('/dao/proposal').send(validProposal);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Create failed' });
    });
  });

  describe('POST /dao/vote', () => {
    const validVote = { proposalId: 2, inFavor: true };

    it('should return 400 if missing or invalid parameters', async () => {
      const res = await request(app).post('/dao/vote').send({ inFavor: 'yes' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Missing or invalid vote parameters' });
    });

    it('should vote on proposal and broadcast', async () => {
      (suiClient.voteOnProposal as jest.Mock).mockResolvedValue('voteDigest');
      const fakeDao = { proposals: [{ id: 2 }] };
      (suiClient.getDaoState as jest.Mock).mockResolvedValue(fakeDao);

      const res = await request(app).post('/dao/vote').send(validVote);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ digest: 'voteDigest' });
      expect(suiClient.voteOnProposal).toHaveBeenCalledWith('test-dao-id', 2, true);
      expect(mockIo!.emit).toHaveBeenCalledWith('proposals', fakeDao.proposals);
    });

    it('should return 500 on vote error', async () => {
      (suiClient.voteOnProposal as jest.Mock).mockRejectedValue(new Error('Vote failed'));

      const res = await request(app).post('/dao/vote').send(validVote);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Vote failed' });
    });
  });
});
