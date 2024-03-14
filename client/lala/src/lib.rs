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
        Err(e) => return "hi".to_owned(),
    };

    match interp::interp(&ast_root, None, false) {
        Ok(_) => "successful interp".to_owned(),
        Err(_) => "unsuccessful interp".to_owned(),
    }
}


