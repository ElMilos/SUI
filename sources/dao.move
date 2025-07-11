module sui_project::dao {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    // ✅ Proposal to zwykła struktura — nie `has key`, bo nie jest obiektem SUI
    public struct Proposal has store {
        id: u64,
        title: vector<u8>,
        description: vector<u8>,
        votes_yes: u64,
        votes_no: u64,
        closed: bool,
    }

    // ✅ DAO to obiekt SUI z UID
    public struct DAO has key {
        id: UID,
        proposals: vector<Proposal>,
        counter: u64,
    }

    // ✅ Tworzenie DAO
    public fun create(ctx: &mut TxContext): DAO {
        DAO {
            id: object::new(ctx),
            proposals: vector::empty<Proposal>(),
            counter: 0,
        }
    }

    // ✅ Dodawanie propozycji
    public fun create_proposal(
        dao: &mut DAO,
        title: vector<u8>,
        description: vector<u8>
    ) {
        let proposal = Proposal {
            id: dao.counter,
            title,
            description,
            votes_yes: 0,
            votes_no: 0,
            closed: false,
        };
        vector::push_back(&mut dao.proposals, proposal);
        dao.counter = dao.counter + 1;
    }

    // ✅ Głosowanie
    public fun vote(dao: &mut DAO, proposal_id: u64, approve: bool) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let p_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (p_ref.id == proposal_id && !p_ref.closed) {
                if (approve) {
                    p_ref.votes_yes = p_ref.votes_yes + 1;
                } else {
                    p_ref.votes_no = p_ref.votes_no + 1;
                };
                break;
            };
            i = i + 1;
        };
    }

    // ✅ Zamknięcie głosowania
    public fun close_proposal(dao: &mut DAO, proposal_id: u64) {
        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let p_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (p_ref.id == proposal_id) {
                p_ref.closed = true;
                break;
            };
            i = i + 1;
        };
    }
}
