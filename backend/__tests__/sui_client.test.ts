// __tests__/sui_client.test.js
/**
 * @jest-environment node
 */

// 1) Ustawiamy ENV zanim zaimportujemy moduł:
process.env.SUI_PACKAGE_ID  = 'pkg::module';
process.env.SUI_DAO_ID      = 'dao-object-id';
process.env.SUI_PRIVATE_KEY = Buffer.concat([Buffer.from([0x00]), Buffer.alloc(32)]).toString('base64');
process.env.SUI_NETWORK     = 'devnet';

// 2) Mockujemy klienta z '@mysten/sui/client':
const mockGetObject            = jest.fn();
const mockExecuteTransaction   = jest.fn().mockResolvedValue({ digest: 'TX123' });
jest.mock('@mysten/sui/client', () => ({
  SuiClient: jest.fn().mockImplementation(() => ({
    getObject: mockGetObject,
    executeTransactionBlock: mockExecuteTransaction,
  })),
  getFullnodeUrl: () => 'https://fullnode.test',
}));

// 3) Mockujemy Transaction z '@mysten/sui/transactions':
const mockMoveCall = jest.fn();
const mockBuild    = jest.fn().mockResolvedValue(Uint8Array.from([1,2,3]));
jest.mock('@mysten/sui/transactions', () => ({
  Transaction: jest.fn().mockImplementation(() => ({
    moveCall: mockMoveCall,
    pure: {
      string: s => s,
      u64:    n => n,
      address:a => a,
      bool:   b => b,
    },
    build: mockBuild,
  })),
}));

// 4) Mockujemy Ed25519Keypair.fromSecretKey:
const fakeSign = jest.fn().mockResolvedValue({ signature: 'SIG' });
jest.mock('@mysten/sui/keypairs/ed25519', () => ({
  Ed25519Keypair: {
    fromSecretKey: () => ({
      signTransaction: fakeSign
    })
  }
}));

// 5) Importujemy testowany moduł:
const {
  getDaoState,
  createProposal,
  voteOnProposal,
  agentDecisionLoop,
} = require('../sui_client');

describe('sui_client.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDaoState', () => {
    it('throws when object not exist', async () => {
      mockGetObject.mockResolvedValue({ error: { code: 'notExists' } });
      await expect(getDaoState('X')).rejects.toThrow(/nie istnieje/);
    });

    it('throws when data missing', async () => {
      mockGetObject.mockResolvedValue({ data: null });
      await expect(getDaoState('X')).rejects.toThrow(/Brak pola `data`/);
    });

    it('throws on unknown dataType', async () => {
      mockGetObject.mockResolvedValue({ data: { content: { dataType: 'foo' } } });
      await expect(getDaoState('X')).rejects.toThrow(/Nieznany dataType/);
    });

    it('parses moveObject correctly', async () => {
      mockGetObject.mockResolvedValue({
        data: {
          content: {
            dataType: 'moveObject',
            fields: {
              proposals: [
                { fields: { id: '5', title: 'T', description: 'D', votes: {} } }
              ]
            }
          }
        }
      });
      const dao = await getDaoState('X');
      expect(Array.isArray(dao.proposals)).toBe(true);
      expect(dao.proposals[0].fields.id).toBe('5');
    });
  });

  describe('createProposal', () => {
    it('builds and executes correct transaction', async () => {
      await createProposal('ID', 'MyTitle', 'MyDesc');

      expect(mockMoveCall).toHaveBeenCalledWith({
        target: 'pkg::module::dao::create_proposal',
        arguments: ['MyTitle','MyDesc',0,'ID']
      });
      expect(mockBuild).toHaveBeenCalled();
      expect(fakeSign).toHaveBeenCalled();
      expect(mockExecuteTransaction).toHaveBeenCalledWith({
        transactionBlock: expect.any(Uint8Array),
        signature: 'SIG',
        options: { showEffects: true },
        requestType: 'WaitForLocalExecution',
      });
    });
  });

  describe('voteOnProposal', () => {
    it('builds and executes correct vote tx', async () => {
      await voteOnProposal('ID', 42, true);

      expect(mockMoveCall).toHaveBeenCalledWith({
        target: 'pkg::module::dao::vote',
        arguments: ['ID', 42, true]
      });
      expect(mockBuild).toHaveBeenCalled();
      expect(fakeSign).toHaveBeenCalled();
      expect(mockExecuteTransaction).toHaveBeenCalled();
    });
  });

  describe('agentDecisionLoop', () => {
    it('logs and exits when no proposals', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(require('../sui_client'), 'getDaoState').mockResolvedValue({ proposals: [] });
      const voteSpy = jest.spyOn(require('../sui_client'), 'voteOnProposal');
      await agentDecisionLoop();
      expect(voteSpy).not.toHaveBeenCalled();
    });

    it('votes for or against based on random', async () => {
      // pierwsze Math.random()>0.5, drugie <0.5
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.1);
      jest.spyOn(require('../sui_client'), 'getDaoState')
        .mockResolvedValue({ proposals: [{ fields:{ id:'7' } }] });
      const voteSpy = jest.spyOn(require('../sui_client'), 'voteOnProposal').mockResolvedValue();

      await agentDecisionLoop();
      expect(voteSpy).toHaveBeenCalledWith('dao-object-id', 7, true);

      voteSpy.mockClear();
      await agentDecisionLoop();
      expect(voteSpy).toHaveBeenCalledWith('dao-object-id', 7, false);

      Math.random.mockRestore();
    });
  });
});
