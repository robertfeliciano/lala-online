use interp::interp;
use wasm_bindgen::prelude::*;
mod commands;
mod interp;
mod matrix;
mod parser;
mod types;

#[wasm_bindgen]
pub fn process_string(input: &str) -> String {
    let ast_root = match parser::parse(&input) {
        Ok(r) => r,
        Err(e) => return e.to_string(),
    };

    match interp(&ast_root, None, false) {
        Ok(res) => res.to_owned(),
        Err(e) => e.to_string(),
    }
}
