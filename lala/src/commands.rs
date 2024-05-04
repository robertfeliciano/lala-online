// use super::interp;
// use super::parser;
use super::types::*;
use std::collections::HashMap;

// pub fn link<'a>(
//     files: &Vec<&str>,
//     env: &HashMap<String, LalaType<'a>>,
// ) -> Result<String, anyhow::Error> {
//     for file in files {
//         let raw_file = std::fs::read_to_string(file)?;
//         let ast_root = parser::parse(&raw_file)?;
//         // IDEA: pass in file name option for linkage instead of bool, append it to the beginning of the linked var names
//         interp::interp(&ast_root, Some(env), false)?;
//     }
//     Ok("_".to_owned())
// }

pub fn debug(env: &HashMap<String, LalaType>) -> Result<String, anyhow::Error> {
    let s = format!("{:?}", env);
    Ok(s)
}
