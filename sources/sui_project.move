/*
/// Module: sui_project
module sui_project::sui_project;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


module sui_project::sui_project;

// Imports the `String` type from the Standard Library
use std::string::String;

/// Returns the "Hello, World!" as a `String`.
public fun sui_project(): String {
    b"Hello, World!".to_string()
}
