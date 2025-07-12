module 0x0::dao {

    use std::string;
    use std::vector;
    use std::option::{self, Option};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock;

    /// Status propozycji
    public enum ProposalStatus {
        Open,
        Closed,
    }

    /// Głos: kto, jak, kiedy i na jakiej podstawie głosował
    public struct Vote has copy, drop, store {
        voter: address,
        in_favor: u16,
        timestamp: u64,
        sentiment_tag: string::String, // np. "positive", "neutral", "negative"
    }

    /// Propozycja DAO
    public struct Proposal has store, drop, copy {
        id: u64,
        title: string::String,
        description: string::String,
        summary: string::String,              // nowość
        proposer: address,
        votes: vector<Vote>,
        status: ProposalStatus,
        ai_decision: option::Option<u16>,    // np. some(true) = AI: za, some(false) = przeciw
        ai_reason: option::Option<string::String>,
        ai_quotes: vector<string::String>,
        sentiment_score: option::Option<u16>, // np. 25 = 0.25
        confidence: option::Option<u16>,      // np. 60 = 0.6
    }

    /// Feedback od społeczności nt. decyzji agenta AI
    public struct Feedback has copy, drop, store {
        proposal_id: u64,
        user: address,
        reaction: string::String, // np. "like", "dislike", "clarify"
    }

    /// DAO jako główny obiekt
    public struct DAO has key, store {
        id: UID,
        proposals: vector<Proposal>,
        feedbacks: vector<Feedback>,
        agent_proposals: vector<u64>, // ID propozycji stworzonych przez AI
        next_id: u64,
    }

    /// Tworzy DAO
    public entry fun create_dao(ctx: &mut TxContext) {
        let dao = DAO {
            id: object::new(ctx),
            proposals: vector::empty<Proposal>(),
            feedbacks: vector::empty<Feedback>(),
            agent_proposals: vector::empty<u64>(),
            next_id: 0,
        };
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(dao, sender);
    }

    /// Tworzy propozycję (może być przez AI lub użytkownika)
    public entry fun create_proposal(
        dao: &mut DAO,
        title: string::String,
        description: string::String,
        is_agent: bool,
        ctx: &TxContext
    ) {
        let id = dao.next_id;
        let proposal = Proposal {
            id,
            title,
            description,
            proposer: tx_context::sender(ctx),
            votes: vector::empty<Vote>(),
            status: ProposalStatus::Open,
        };
        vector::push_back(&mut dao.proposals, proposal);
        if (is_agent) {
            vector::push_back(&mut dao.agent_proposals, id);
        };
        dao.next_id = dao.next_id + 1;
    }

    /// Głosowanie (z tagiem sentymentu i timestampem)
    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        in_favor: bool,
        sentiment_tag: string::String,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::now_ms(); // aktualny czas w ms
        let vote = Vote {
            voter: sender,
            in_favor,
            timestamp,
            sentiment_tag,
        };

        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id && match prop_ref.status {
                ProposalStatus::Open => true,
                ProposalStatus::Closed => false,
            }) {
                vector::push_back(&mut prop_ref.votes, vote);
                return;
            };
            i = i + 1;
        };
    }

    /// Zamknięcie propozycji (np. po określonym czasie lub liczbie głosów)
    public entry fun close_proposal(
        dao: &mut DAO,
        proposal_id: u64
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                prop_ref.status = ProposalStatus::Closed;
                return;
            };
            i = i + 1;
        };
    }

    /// Reakcja społeczności na decyzje AI (np. w dashboardzie)
    public entry fun give_feedback(
        dao: &mut DAO,
        proposal_id: u64,
        reaction: string::String,
        ctx: &TxContext
    ) {
        let feedback = Feedback {
            proposal_id,
            user: tx_context::sender(ctx),
            reaction,
        };
        vector::push_back(&mut dao.feedbacks, feedback);
    }

    /// Getter: pobierz propozycję po ID
    public fun get_proposal(dao: &DAO, proposal_id: u64): Option<Proposal> {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow(&dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                return option::some(*prop_ref);
            };
            i = i + 1;
        };
        option::none()
    }

    /// Getter: pobierz wszystkie propozycje stworzone przez AI
    public fun get_agent_proposals(dao: &DAO): vector<u64> {
        dao.agent_proposals
    }

    /// Getter: pobierz feedback na konkretną propozycję
    public fun get_feedbacks(dao: &DAO, proposal_id: u64): vector<Feedback> {
        let mut res = vector::empty<Feedback>();
        let len = vector::length(&dao.feedbacks);
        let mut i = 0;
        while (i < len) {
            let fb = vector::borrow(&dao.feedbacks, i);
            if (fb.proposal_id == proposal_id) {
                vector::push_back(&mut res, *fb);
            };
            i = i + 1;
        };
        res
    }
}