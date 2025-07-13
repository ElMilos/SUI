module 0x0::dao {
    // --- Imports ---
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use sui::transfer;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::signer;
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

    /// Głos: kto, kod głosu (0=yes, 1=no, 2=abstain), kiedy, sentyment oraz zaufanie
    public struct Vote has copy, drop, store {
        voter: address,
        vote_code: u8,
        timestamp: u64,
        sentiment: u64,
        confidence: u64,
    }

    /// Feedback od społeczności (komentarze)
    public struct Feedback has copy, drop, store {
        proposal_id: u64,
        user: address,
        reaction: string::String,
    }

    /// Propozycja DAO
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

     /// Główny obiekt DAO
    public struct DAO has key, store {
        id: UID,
        proposals: vector<Proposal>,
        next_id: u64,
        authorized_devices: vector<address>,
        owner: address,
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
        let creator = sender(ctx);
        let dao = DAO {
            id: new(ctx),
            proposals: vector::empty<Proposal>(),
            next_id: 0,
            authorized_devices: vector::empty<address>(),
            owner: creator,
        };
        transfer::public_transfer(dao, creator);
    }

    /// Dodaje adres urządzenia z uprawnieniem do edycji
    public entry fun add_device(dao: &mut DAO, signer_ref: &signer, new_device: address) {
        let sender_addr = signer::address_of(signer_ref);
        assert!(sender_addr == dao.owner, 0);
        vector::push_back(&mut dao.authorized_devices, new_device);
    }

    /// Sprawdza, czy adres ma dostęp do DAO
    fun has_access(dao: &DAO, addr: address): bool {
        let len = vector::length(&dao.authorized_devices);
        let mut i = 0;
        while (i < len) {
            if (*vector::borrow(&dao.authorized_devices, i) == addr) {
                return true;
            };
            i = i + 1;
        };
        false
    }

    /// Przykładowa funkcja wykonywana przez urządzenie
    public entry fun device_action(dao: &mut DAO, signer_ref: &signer, message: vector<u8>) {
        let addr = signer::address_of(signer_ref);
        assert!(has_access(dao, addr), 1);

        let id = dao.next_id;
        dao.next_id = id + 1;
        let proposal = Proposal { id: id, description: message };
        vector::push_back(&mut dao.proposals, proposal);
    }

    /// Tworzy propozycję (tytuł + data)
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

    /// Rozpoczyna fazę głosowania (tylko autor)
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
                assert!(prop.proposer == tx_context::sender(ctx), E_PROPOSER_ONLY);
                assert!(prop.status == ProposalStatus::Open, E_WRONG_STATUS_OPEN);
                prop.status = ProposalStatus::Voting;
                // Emituj zdarzenie AgentEvent bezpośrednio tutaj
                event::emit(AgentEvent {
                    proposal_id,
                    status: prop.status,
                });
                return;
            };
            i = i + 1;
        };
        assert!(false, E_PROPOSAL_NOT_FOUND); // Jeśli propozycja nie zostanie znaleziona
    }

    /// Składa głos (vote_code: 0=yes, 1=no, 2=abstain)
    /// Parameter `timestamp` is provided directly as u64
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
                return
            };
            i = i + 1;
        };
    }

    /// Zatwierdzanie propozycji (tylko autor)
    public entry fun approve_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                assert!(prop.status == ProposalStatus::Voting, 4);
                assert!(prop.proposer == tx_context::sender(ctx), 5);
                prop.status = ProposalStatus::Approved;
                return
            };
            i = i + 1;
        };
    }

    /// Odrzucanie propozycji (tylko autor)
    public entry fun reject_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                assert!(prop.status == ProposalStatus::Voting, 6);
                assert!(prop.proposer == tx_context::sender(ctx), 7);
                prop.status = ProposalStatus::Rejected;
                return
            };
            i = i + 1;
        };
    }

    /// Dodaje feedback (tylko w fazie dyskusji)
    public entry fun give_feedback(
        dao: &mut DAO,
        proposal_id: u64,
        reaction: string::String,
        ctx: &mut TxContext
    ) {
        let fb = Feedback {
            proposal_id,
            user: tx_context::sender(ctx),
            reaction,
        };
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                assert!(prop.status == ProposalStatus::Open, 8);
                vector::push_back(&mut prop.feedbacks, fb);
                return
            };
            i = i + 1;
        };
    }

    /// Pobiera propozycję po ID
    public fun get_proposal(dao: &DAO, id: u64): Option<Proposal> {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let p = vector::borrow(&dao.proposals, i);
            if (p.id == id) { return option::some(*p)};
            i = i + 1;
        };
        option::none()
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
    // Zamyka głosowanie — bez warunków czasowych, oceniając wyniki
    public entry fun close_voting(
        dao: &mut DAO,
        proposal_id: u64
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
    
        while (i < len) {
            let mut prop = vector::borrow_mut(&mut dao.proposals, i);
            if (prop.id == proposal_id) {
                // tylko dla propozycji w fazie głosowania
                assert!(prop.status == ProposalStatus::Voting, E_WRONG_STATUS_VOTING);
    
                let mut yes = 0;
                let mut no = 0;
    
                let votes = &prop.votes;
                let n = vector::length(votes);
                let mut j = 0;
    
                while (j < n) {
                    let vote = vector::borrow(votes, j);
                    if (vote.vote_code == 0) {
                        yes = yes + 1;
                    } else if (vote.vote_code == 1) {
                        no = no + 1;
                    };
                    j = j + 1;
                };
    
                // Prosty mechanizm większości
                if (yes > no) {
                    prop.status = ProposalStatus::Approved;
                } else {
                    prop.status = ProposalStatus::Rejected;
                };
    
                return;
            };
            i = i + 1;
        };

    /// Pobiera wszystkie propozycje
    public fun list_proposals(dao: &DAO): vector<Proposal> {
        dao.proposals
    }
}