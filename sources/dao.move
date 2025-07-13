module 0x0::dao {
    // --- Imports ---
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use sui::transfer;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    // --- Error Constants ---
    const E_PROPOSER_ONLY: u64 = 1;
    const E_WRONG_STATUS_OPEN: u64 = 2;
    const E_WRONG_STATUS_VOTING: u64 = 3;
    const E_INVALID_VOTE_CODE: u64 = 100;
    const E_PROPOSAL_NOT_FOUND: u64 = 101;

    // --- Enums and Structs ---
    
    // Proposal status: Open, Voting, Approved, Rejected
    public enum ProposalStatus has store, drop, copy {
        Open,
        Voting,
        Approved,
        Rejected,
    }

    // Voice: who, voice code (0=yes, 1=no, 2=abstain), when, sentiment and trust
    public struct Vote has copy, drop, store {
        voter: address,
        vote_code: u8,
        timestamp: u64,
        sentiment: u64,
        confidence: u64,
    }

    // Community Feedback (Comments)
    public struct Feedback has copy, drop, store {
        proposal_id: u64,
        user: address,
        reaction: string::String,
    }

    // DAO Proposal
    public struct Proposal has store, drop, copy {
        id: u64,
        date: u64,
        title: string::String,
        summary: string::String,
        proposer: address,
        votes: vector<Vote>,
        status: ProposalStatus,
        feedbacks: vector<Feedback>,
    }

    // Main DAO object
    public struct DAO has key, store {
        id: UID,
        proposals: vector<Proposal>,
        next_id: u64,
    }

    public struct AgentEvent has store, drop, copy {
        proposal_id: u64,
        status: ProposalStatus,
    }

    public struct ProposalNotification has store {
        proposal_id: u64,
        dao_id: address,
        notification_type: vector<u8>,
    }

    // Creates a DAO
    public entry fun create_dao(ctx: &mut TxContext) {
        let dao = DAO {
            id: object::new(ctx),
            proposals: vector::empty<Proposal>(),
            next_id: 0,
        };
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(dao, sender);
    }

    // Creates a proposal (title + date)
    public entry fun create_proposal(
        dao: &mut DAO,
        title: string::String,
        summary: string::String,
        date: u64,
        ctx: &mut TxContext
    ): u64 {
        let id = dao.next_id;
        let proposal = Proposal {
            id,
            date,
            title,
            summary,
            proposer: tx_context::sender(ctx),
            votes: vector::empty<Vote>(),
            status: ProposalStatus::Open,
            feedbacks: vector::empty<Feedback>(),
        };
        vector::push_back(&mut dao.proposals, proposal);
        dao.next_id = id + 1;
        id 
    }

    // Starts the voting phase (author only)
    public entry fun start_voting(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                assert!(prop.proposer == tx_context::sender(ctx), 1);
                assert!(prop.status == ProposalStatus::Open, 2);
                prop.status = ProposalStatus::Voting;
                //notify_agents(dao.id, proposal_id);
                return;
            };
            i = i + 1;
        };
    }

    // Votes (vote_code: 0=yes, 1=no, 2=abstain)
    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        vote_code: u8,
        timestamp: u64,
        sentiment: u64,
        confidence: u64,
        ctx: &mut TxContext
    ) {
        assert!(vote_code <= 2, 100);
        let vote = Vote {
            voter: tx_context::sender(ctx),
            vote_code,
            timestamp,
            sentiment,
            confidence,
        };
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                assert!(prop.status == ProposalStatus::Voting, 3);
                vector::push_back(&mut prop.votes, vote);
                return;
            };
            i = i + 1;
        };
    }

    public entry fun notify_agents(
        dao: &mut DAO,
        proposal_id: u64,
        // ctx jest nieużywany, ale można go zostawić na przyszłość
        _ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        let mut found_proposal_status: Option<ProposalStatus> = option::none();

        while (i < len) {
            let prop = vector::borrow(&dao.proposals, i);
            if (prop.id == proposal_id) {
                found_proposal_status = option::some(prop.status);
                break;
            };
            i = i + 1;
        };

        assert!(option::is_some(&found_proposal_status), E_PROPOSAL_NOT_FOUND);

        let status = option::destroy_some(found_proposal_status);

        let agent_event = AgentEvent {
            proposal_id,
            status,
        };

        event::emit(agent_event);
    }
}