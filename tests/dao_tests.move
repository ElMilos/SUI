module 0x0::dao_tests {
    use std::string;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::test_scenario;
    use 0x0::dao::{
        DAO,
        ProposalStatus,
        create_dao,
        create_proposal,
        start_voting,
        vote,
        approve_proposal,
        give_feedback,
        get_proposal,
        list_proposals
    };

    #[test]
    fun test_proposal_lifecycle() {
        // Addresses for author and voter
        let author = @0x1;
        let voter = @0x2;

        // Transaction 1: create DAO
        let mut scenario = test_scenario::begin(author);
        {
            create_dao(scenario.ctx());
        };

        // Transaction 2: create a proposal
        scenario.next_tx(author);
        {
            let mut dao = scenario.take_from_sender<DAO>();
            create_proposal(&mut dao, string::utf8(b"Test Proposal"), 100, scenario.ctx());
            scenario.return_to_sender(dao);
        };

        // Transaction 3: start voting phase
        scenario.next_tx(author);
        {
            let mut dao = scenario.take_from_sender<DAO>();
            start_voting(&mut dao, 0, scenario.ctx());
            scenario.return_to_sender(dao);
        };

        // Transaction 4: cast a vote
        scenario.next_tx(voter);
        {
            let mut dao = scenario.take_from_sender<DAO>();
            vote(&mut dao, 0, 0, 200, 50, 80, scenario.ctx());
            scenario.return_to_sender(dao);
        };

        // Transaction 5: approve the proposal
        scenario.next_tx(author);
        {
            let mut dao = scenario.take_from_sender<DAO>();
            approve_proposal(&mut dao, 0, scenario.ctx());
            scenario.return_to_sender(dao);
        };

        // Transaction 6: verify proposal status
        scenario.next_tx(author);
        {
            let dao = scenario.take_from_sender<DAO>();
            let opt = get_proposal(&dao, 0);
            assert!(option::is_some(&opt), 1);
            let prop = *option::borrow(&opt);
            assert!(prop.status == ProposalStatus::Approved, 2);
            scenario.return_to_sender(dao);
        };

        scenario.end();
    }

    #[test]
    fun test_feedback_collection() {
        // Dummy context for unit testing
        let mut ctx = TxContext::dummy();

        // Manually construct a DAO with no proposals
        let id = object::new(&mut ctx);
        let mut dao = DAO { id: id, proposals: vector::empty<Proposal>(), next_id: 0 };

        // Create a proposal in "Open" status
        create_proposal(&mut dao, string::utf8(b"Feedback Test"), 300, &mut ctx);

        // Provide feedback for proposal 0
        give_feedback(&mut dao, 0, string::utf8(b"Looks good!"), &mut ctx);

        // Verify feedbacks vector has one entry
        let proposals = list_proposals(&dao);
        let prop = vector::borrow(&proposals, 0);
        assert!(vector::length(&prop.feedbacks) == 1, 1);
    }
}
