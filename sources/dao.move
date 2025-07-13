module 0x1::governance {
    use sui::tx_context::TxContext;
    use sui::object;
    use std::vector;
    use sui::transfer;
    use sui::object::UID;

    // — kody błędów
    const E_NOT_MEMBER: u64 = 1;
    const E_PROPOSAL_NOT_FOUND: u64 = 2;
    const E_DEADLINE_PASSED: u64 = 3;

    /// Status głosowania
    public enum ProposalStatus has store, drop {
        Open,
        Voting,
        Approved,
        Rejected
    }

    /// Propozycja (przechowywana w wektorze DAO)
    public struct Proposal has store, drop {
        id: u64,
        proposer: address,
        description: vector<u8>,
        status: ProposalStatus,
        yes_count: u64,
        no_count: u64,
        abstain_count: u64,
        deadline: u64,  // numer epoki
    }

    /// Główny obiekt DAO
    public struct DAO has key, store {
        id: UID,
        owner: address,
        members: vector<address>,
        proposals: vector<Proposal>,
        next_proposal_id: u64,
    }

    /// Tworzy i publikuje nowe DAO pod adresem nadawcy
    public entry fun create_dao(ctx: &mut TxContext) {
        let sender = ctx.sender();
        let dao = DAO {
            id: object::new(ctx),
            owner: sender,
            members: vector::singleton(sender),
            proposals: vector::empty(),
            next_proposal_id: 1,
        };
        transfer::transfer(dao, sender);
    }

    /// Zaprasza nowego członka (tylko jeśli jesteś już członkiem)
    public entry fun invite_member(
        dao: &mut DAO,
        new_member: address,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(is_member(sender, dao), E_NOT_MEMBER);
        vector::push_back(&mut dao.members, new_member);
    }

    /// Składasz propozycję (każdy członek)
    public entry fun propose(
        dao: &mut DAO,
        description: vector<u8>,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(is_member(sender, dao), E_NOT_MEMBER);
        let pid = dao.next_proposal_id;
        dao.next_proposal_id = pid + 1;
        let prop = Proposal {
            id: pid,
            proposer: sender,
            description,
            status: ProposalStatus::Open,
            yes_count: 0,
            no_count: 0,
            abstain_count: 0,
            deadline,
        };
        vector::push_back(&mut dao.proposals, prop);
    }

    /// Głosowanie (0=yes, 1=no, inaczej=abstain)
    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        code: u8,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(is_member(sender, dao), E_NOT_MEMBER);
        let len = vector::length(&dao.proposals);
        let mut i: u64 = 0;
        while (i < len) {
            let mut p = vector::borrow_mut(&mut dao.proposals, i);
            if (p.id == proposal_id) {
                let now = ctx.epoch();
                assert!(p.deadline > now, E_DEADLINE_PASSED);
                if (code == 0) {
                    p.yes_count = p.yes_count + 1;
                } else if (code == 1) {
                    p.no_count = p.no_count + 1;
                } else {
                    p.abstain_count = p.abstain_count + 1;
                };
                p.status = ProposalStatus::Voting;
                return;
            };
            i = i + 1;
        }; 
        abort E_PROPOSAL_NOT_FOUND;
    }

    /// Po upływie deadline’u wykonujesz propozycję
    public entry fun execute_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i: u64 = 0;
        let now = ctx.epoch();
        while (i < len) {
            let mut p = vector::borrow_mut(&mut dao.proposals, i);
            if (p.id == proposal_id) {
                assert!(p.deadline <= now, E_DEADLINE_PASSED);
                if (p.yes_count > p.no_count) {
                    p.status = ProposalStatus::Approved;
                } else {
                    p.status = ProposalStatus::Rejected;
                };
                return;
            };
            i = i + 1;
        };
        abort E_PROPOSAL_NOT_FOUND;
    }

    /// Sprawdza, czy `addr` jest w `members`
    fun is_member(addr: address, dao: &DAO): bool {
        let len = vector::length(&dao.members);
        let mut i: u64 = 0;
        while (i < len) {
            if (*vector::borrow(&dao.members, i) == addr) {
                return true;
            };
            i = i + 1;
        };
        false
    }
}
