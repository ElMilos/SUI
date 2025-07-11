module 0x0::dao {

    use std::string;



    /// Głos: kto i jak głosował
    public struct Vote has copy, drop, store {
        voter: address,
        in_favor: bool,
    }

    /// Propozycja DAO
    public struct Proposal has store, drop, copy {
        id: u64,
        title: string::String,
        description: string::String,
        proposer: address,
        votes: vector<Vote>,
    }

    /// DAO jako obiekt z możliwością przechowywania i dostępu
    public struct DAO has key, store {
        id: UID,
        proposals: vector<Proposal>,
        next_id: u64,
    }

    /// PUBLIC: Tworzy DAO i przekazuje go wywołującemu (brak `entry`)
    public fun create_dao(ctx: &mut TxContext): DAO {
        DAO {
            id: object::new(ctx),
            proposals: vector::empty<Proposal>(),
            next_id: 0,
        }
    }

    /// ENTRY: Tworzy nową propozycję
    public entry fun create_proposal(
        dao: &mut DAO,
        title: string::String,
        description: string::String,
        ctx: &TxContext
    ) {
        let proposal = Proposal {
            id: dao.next_id,
            title,
            description,
            proposer: tx_context::sender(ctx),
            votes: vector::empty<Vote>(),
        };
        vector::push_back(&mut dao.proposals, proposal);
        dao.next_id = dao.next_id + 1;
    }

    /// ENTRY: Głosowanie na propozycję
    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        in_favor: bool,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let vote = Vote {
            voter: sender,
            in_favor,
        };

        let len = vector::length(&dao.proposals);
        let mut i = 0;
        while (i < len) {
            let prop_ref = vector::borrow_mut(&mut dao.proposals, i);
            if (prop_ref.id == proposal_id) {
                vector::push_back(&mut prop_ref.votes, vote);
                return
            };
            i = i + 1;
        };
    }


public fun get_proposal(dao: &DAO, proposal_id: u64): Option<Proposal> {
    let len = vector::length(&dao.proposals);
    let mut i = 0;
    while (i < len) {
        let prop_ref = vector::borrow(&dao.proposals, i);
        if (prop_ref.id == proposal_id) {
            return option::some(*prop_ref) // 
        };
        i = i + 1;
    };
    option::none()
}
}
