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
        Err(_) => return "parse error".to_owned(),
    };

    match interp(&ast_root, None, false) {
        Ok(res) => res.to_owned(),
        Err(_) => "unsuccessful interp".to_owned(),
    }
}
