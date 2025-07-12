module 0x0::dao {
    use std::string;
    use sui::clock::{Clock, timestamp_ms};


    /// Status propozycji: dyskusja (Open), głosowanie (Voting), zatwierdzona (Approved), odrzucona (Rejected)
    public enum ProposalStatus has store, drop, copy {
        Open,
        Voting,
        Approved,
        Rejected,
    }

    /// Głos: kto, kod głosu (0=Against, 1=Neutral, 2=InFavor), kiedy i na jakiej podstawie głosował
    public struct Vote has copy, drop, store {
        voter: address,
        vote_code: u16,
        timestamp: u64,
        sentiment_tag: string::String,
    }

    /// Feedback od społeczności (komentarze) – dostępne tylko podczas otwartej dyskusji
    public struct Feedback has copy, drop, store {
        proposal_id: u64,
        user: address,
        reaction: string::String,
    }

    /// Propozycja DAO z rozszerzonymi metadanymi
    public struct Proposal has store, drop, copy {
        id: u64,
        title: string::String,
        summary: string::String,
        explorer_url: string::String,
        ai_decision: bool,
        reason: string::String,
        sentiment: u64,
        confidence: u64,
        voted: bool,
        quotes: vector<string::String>,
        date: u64,
        proposer: address,
        votes: vector<Vote>,
        feedbacks: vector<Feedback>,
        status: ProposalStatus,
    }

    /// DAO jako główny obiekt
    public struct DAO has key, store {
        id: UID,
        proposals: vector<Proposal>,
        next_id: u64,
    }

    /// Tworzy DAO
    public entry fun create_dao(ctx: &mut TxContext) {
        let dao = DAO {
            id: object::new(ctx),
            proposals: vector::empty<Proposal>(),
            next_id: 0,
        };
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(dao, sender);
    }

    /// Tworzy propozycję – start dyskusji (Open)
    public entry fun create_proposal(
        dao: &mut DAO,
        title: string::String,
        summary: string::String,
        explorer_url: string::String,
        ai_decision: bool,
        reason: string::String,
        sentiment: u64,
        confidence: u64,
        voted: bool,
        quotes: vector<string::String>,
        date: u64,
        ctx: &mut TxContext
    ) {
        let id = dao.next_id;
        let proposal = Proposal {
            id,
            title,
            summary,
            explorer_url,
            ai_decision,
            reason,
            sentiment,
            confidence,
            voted,
            quotes,
            date,
            proposer: tx_context::sender(ctx),
            votes: vector::empty<Vote>(),
            feedbacks: vector::empty<Feedback>(),
            status: ProposalStatus::Open,
        };
        vector::push_back(&mut dao.proposals, proposal);
        dao.next_id = id + 1;
    }

    /// Przejście z dyskusji do głosowania – tylko autor może uruchomić
    public entry fun start_voting(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                assert!(prop_ref.proposer == tx_context::sender(ctx), 1);
                assert!(prop_ref.status == ProposalStatus::Open, 2);
                prop_ref.status = ProposalStatus::Voting;
                return
            };
            i = i + 1;
        };
    }

    /// Głosowanie – dostępne tylko w stanie Voting
    /// vote_code: 0 => Against, 1 => Neutral, 2 => InFavor
    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        vote_code: u16,
        sentiment_tag: string::String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(vote_code <= 2, 100);
        let timestamp = timestamp_ms(clock);
        let vote = Vote {
            voter: tx_context::sender(ctx),
            vote_code,
            timestamp,
            sentiment_tag,
        };
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                assert!(prop_ref.status == ProposalStatus::Voting, 3);
                vector::push_back(&mut prop_ref.votes, vote);
                return
            };
            i = i + 1;
        };
    }

    /// Zatwierdzenie propozycji – tylko po głosowaniu i tylko autor
    public entry fun approve_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                assert!(prop_ref.status == ProposalStatus::Voting, 4);
                assert!(prop_ref.proposer == tx_context::sender(ctx), 5);
                prop_ref.status = ProposalStatus::Approved;
                return
            };
            i = i + 1;
        };
    }

    /// Odrzucenie propozycji – tylko po głosowaniu i tylko autor
    public entry fun reject_proposal(
        dao: &mut DAO,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                assert!(prop_ref.status == ProposalStatus::Voting, 6);
                assert!(prop_ref.proposer == tx_context::sender(ctx), 7);
                prop_ref.status = ProposalStatus::Rejected;
                return
            };
            i = i + 1;
        };
    }

    /// Dodaj komentarz/feedback – tylko podczas dyskusji (Open)
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
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                assert!(prop_ref.status == ProposalStatus::Open, 8);
                vector::push_back(&mut prop_ref.feedbacks, fb);
                return
            };
            i = i + 1;
        };
    }

    /// Gettery
    public fun get_proposal(dao: &DAO, id: u64): Option<Proposal> {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let p = vector::borrow(&dao.proposals, i);
            if (p.id == id) { return option::some(*p) };
            i = i + 1;
        };
        option::none()
    }

    /// Pobierz wszystkie propozycje
    public fun list_proposals(dao: &DAO): vector<Proposal> {
        dao.proposals
    }
}
