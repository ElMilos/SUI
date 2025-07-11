#[test_only]
module sui_project::sui_project_tests;

    use sui_project::sui_project;

    #[test]
    fun test_sui_project() {
        assert!(sui_project::sui_project() == b"Hello, World!".to_string(), 0);
    }
