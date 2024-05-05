use super::commands;
use super::parser::*;
use super::types::*;
use anyhow::{anyhow, Error};
use std::{collections::HashMap, ops::Deref};

#[inline]
fn get_value<'a>(map: &mut HashMap<String, LalaType<'a>>, key: &'a String) -> LalaType<'a> {
    match map.get(key) {
        Some(val) => val.clone(),
        None => panic!("Key not found in the hashmap: {}", key),
    }
}

#[inline]
fn eval_expr<'a, 'b>(
    env: &mut HashMap<String, LalaType<'a>>,
    expr: &'b AstNode<'b>,
    func: &str,
) -> LalaType<'a>
where
    'b: 'a,
{
    match expr {
        AstNode::Ident(id) => get_value(env, id),
        AstNode::MonadicOp { verb, expr } => eval_monadic_op(expr, env, verb),
        AstNode::DyadicOp { verb, lhs, rhs } => eval_dyadic_op(lhs, rhs, env, verb),
        AstNode::Matrix(m) => LalaType::Matrix(construct_matrix(m).unwrap()),
        _ => panic!("Can only call {} on a matrix.", func),
    }
}

fn eval_monadic_op<'a, 'expr>(
    expr: &'expr AstNode<'expr>,
    env: &mut HashMap<String, LalaType<'a>>,
    verb: &'a MonadicVerb,
) -> LalaType<'a>
where
    'expr: 'a,
{
    let func = verb.to_string();
    let matrix = match eval_expr(env, expr, &func) {
        LalaType::Matrix(mat) => mat,
        _ => panic!("Can only call {func} on a matrix."),
    };
    match verb {
        MonadicVerb::Inverse => LalaType::Matrix(matrix.inverse()),
        MonadicVerb::Rank => LalaType::Integer(matrix.rank()),
        MonadicVerb::RREF => LalaType::Matrix(matrix.rref()),
        MonadicVerb::Transpose => LalaType::Matrix(matrix.transpose()),
        MonadicVerb::Determinant => LalaType::Double(matrix.det()),
    }
}

fn eval_dyadic_op<'a, 'lhs, 'rhs>(
    lhs: &'lhs AstNode<'lhs>,
    rhs: &'rhs AstNode<'rhs>,
    env: &mut HashMap<String, LalaType<'a>>,
    verb: &'a DyadicVerb,
) -> LalaType<'a>
where
    'lhs: 'a,
    'rhs: 'a,
{
    let func = verb.to_string();
    let leftside = if let LalaType::Matrix(left) = eval_expr(env, lhs, &func) {
        left
    } else {
        panic!("can only call {func} on a matrix");
    };
    let rightside = if let LalaType::Matrix(right) = eval_expr(env, rhs, &func) {
        right
    } else {
        panic!("can only call {func} on a matrix");
    };
    match verb {
        DyadicVerb::Dot => LalaType::Matrix(leftside.dot(rightside.clone())),
        DyadicVerb::Plus => LalaType::Matrix(leftside.combine(rightside, |a, b| a + b)),
        DyadicVerb::Times => LalaType::Matrix(leftside.combine(rightside, |a, b| a * b)),
    }
}

fn eval_assignment<'a, 'b>(
    ident: &'a String,
    expr: &'b Box<AstNode<'b>>,
    env: &mut HashMap<String, LalaType<'a>>,
) -> Result<(), Error>
where
    'b: 'a,
{
    match expr.deref() {
        AstNode::Integer(scalar) => match env.insert(ident.to_string(), LalaType::Integer(*scalar))
        {
            _ => Ok(()),
        },
        AstNode::DoublePrecisionFloat(scalar) => {
            match env.insert(ident.to_string(), LalaType::Double(*scalar)) {
                _ => Ok(()),
            }
        }
        AstNode::Ident(rhs_ident) => {
            match env.insert(ident.to_string(), env.get(rhs_ident).unwrap().clone()) {
                _ => Ok(()),
            }
        }
        AstNode::Matrix(v) => {
            let mat = construct_matrix(v).unwrap();
            match env.insert(ident.to_string(), LalaType::Matrix(mat)) {
                _ => Ok(()),
            }
        }
        AstNode::MonadicOp { verb, expr } => {
            let result = eval_monadic_op(expr, env, verb);
            match env.insert(ident.to_string(), result) {
                _ => Ok(()),
            }
        }
        AstNode::DyadicOp { verb, lhs, rhs } => {
            let result = eval_dyadic_op(lhs, rhs, env, verb);
            match env.insert(ident.to_string(), result) {
                _ => Ok(()),
            }
        }
        AstNode::App((name, params)) => {
            let result = match interp_app(name, params, env) {
                Ok(val) => val,
                Err(e) => return Err(e),
            };
            match env.insert(ident.to_string(), result) {
                _ => Ok(())
            }
        },
        _ => Err(anyhow!("interpreter error!")),
    }
}

fn eval_cmd(
    cmd: &str,
    _cmd_params: &Vec<&str>,
    env: &mut HashMap<String, LalaType>,
) -> Result<String, anyhow::Error> {
    match cmd {
        // "link" => commands::link(cmd_params, env),
        "dbg" => commands::debug(env),
        _ => todo!(),
    }
}

fn interp_fun<'a>(
    name: &String,
    params: &Vec<AstNode<'a>>,
    body: &Vec<AstNode<'a>>,
    env: &mut HashMap<String, LalaType<'a>>,
) -> () {
    match env.insert(
        name.to_string(),
        LalaType::Fun((name.to_string(), params.to_vec(), body.to_vec())),
    ) {
        _ => (),
    }
}

fn interp_app<'a, 'b>(
    name: &'a String,
    params: &'a Vec<AstNode<'a>>,
    env: &HashMap<String, LalaType<'b>>,
) -> Result<LalaType<'b>, Error>
where
    'a: 'b,
{
    let temp_env = env.clone();
    let (_, aliases_o, body_o) = match temp_env.get(name) {
        Some(LalaType::Fun((n, a, b))) => (n, a, b),
        _ => {
            return Err(anyhow!("Function {name} referenced before definition"));
        }
    };
    let aliases = aliases_o.clone();
    if params.len() != aliases.len() {
        return Err(anyhow!(
            "{name} supplied incorrect number of arguments. Expected {}, found {}",
            aliases.len(),
            params.len()
        ));
    }
    let mut function_scope = temp_env.clone();
    for (provided_node, alias_node) in params.iter().zip(aliases.iter()) {
        // aliases are the parameter names in the function signature
        // we need to bind the value of the provided params in the function call to these aliases
        // for the scope of the function

        // get the identifier alias for the current parameter
        let alias = match alias_node.clone() {
            AstNode::Ident(i) => i,
            _ => {
                return Err(anyhow!("how the hell"));
            }
        };

        // evaluate the provided parameter
        let provided = match provided_node {
            AstNode::Integer(int) => LalaType::Integer(*int),
            AstNode::DoublePrecisionFloat(d) => LalaType::Double(*d),
            AstNode::MonadicOp { verb, expr } => {
                eval_monadic_op(&expr, &mut (temp_env.clone()), &verb)
            }
            AstNode::DyadicOp { verb, lhs, rhs } => {
                eval_dyadic_op(&lhs, &rhs, &mut (temp_env.clone()), &verb)
            }
            AstNode::Ident(i) => {
                match function_scope.get(i) {
                    Some(val) => val.clone(),
                    None => { return Err(anyhow!("identifer {i} referenced before definition")); },
                }
            },
            AstNode::Matrix(m) => {
                if let Ok(mat) = construct_matrix(&m) {
                    LalaType::Matrix(mat)
                } else {
                    return Err(anyhow!("problem passing matrix to function..."));
                }
            }
            AstNode::App((func_name, func_params)) => {
                let temp =
                    if let Ok(something) = interp_app(func_name, func_params, &temp_env.clone()) {
                        something
                    } else {
                        return Err(anyhow!(
                            "issue applying function {func_name} as a parameter"
                        ));
                    };
                temp
            }
            _ => {
                return Err(anyhow!("interpreter error..."));
            }
        };

        // add the value of the parameter under the alias for the function's scope
        function_scope.insert(alias.clone(), provided);
    }

    // now that the parameter values have been assigned, we just need to interpret the
    // body of the function and return the result of the last expression

    let body = body_o.to_owned().leak();
    // function body can only contain assignment of variables and functions
    for expr in body[0..body.len() - 1].iter() {
        match expr {
            AstNode::Assignment { ident, expr } =>
                match eval_assignment(ident, expr, &mut function_scope) {
                    Ok(_) => (),
                    Err(e) => { return Err(e); },
                },
            AstNode::Fun((name, params, body)) => {
                interp_fun(name, params, body, &mut function_scope)
            },
            _ => { return Err(anyhow!("function body only allows assigment and function declarations")); }
        }
    }

    let another_body = body_o.to_owned();
    let last_expr_o = match another_body.last() {
        Some(res) => res,
        None => {
            return Err(anyhow!("empty function body somehow!"));
        }
    };

    let last_expr = last_expr_o.to_owned();

    let final_result = match last_expr {
        // FUNCTIONS MUST END WITH IDENTIFIERS AS THE RETURN VALUE
        AstNode::Ident(id) => {
            match function_scope.get(&id) {
                Some(val) => val,
                None => todo!(),
            }
        },
        _ => { return Err(anyhow!("return statement must only be an identifier")); }
    };

    Ok(final_result.clone())

    // let cloned_result = final_result.clone();
    // Ok(cloned_result)

    // Ok(LalaType::Ident("a".to_owned()))
}

pub fn interp<'a>(
    ast: &'a [Box<AstNode<'_>>],
    map: Option<&mut HashMap<String, LalaType<'a>>>,
    tcp: bool,
) -> Result<String, Error>
{
    let mut binding = HashMap::new();
    #[allow(unused_mut)]
    let mut env: &mut HashMap<String, LalaType> = match map {
        Some(m) => m,
        None => &mut binding,
    };

    let mut result = String::new();

    for node in ast {
        let _ = match node.deref() {
            AstNode::Assignment { ident, expr } => {
                let _ = eval_assignment(ident, expr, env);
                // if tcp {
                //     return Ok(format!("{}", env.get(ident).unwrap()));
                // }
                // return Ok("".to_owned());
                result = if tcp {
                    format!("{}", env.get(ident).unwrap())
                } else {
                    result
                };
            }
            AstNode::MonadicOp { verb, expr } => {
                let temp = eval_monadic_op(expr, env, verb);
                // if tcp {
                //     return Ok(result.to_string());
                // }
                // return Ok("".to_owned());
                result = if tcp { format!("{}", temp) } else { result };
            }
            AstNode::DyadicOp { verb, lhs, rhs } => {
                let temp = eval_dyadic_op(lhs, rhs, env, verb);
                // if tcp {
                //     return Ok(result.to_string());
                // }
                // return Ok("".to_owned());
                result = if tcp { format!("{}", temp) } else { result };
            }
            AstNode::Ident(var) => {
                let printable = format!("{}", env.get(var).unwrap());
                // if tcp {
                //     return Ok(printable);
                // }
                // return Ok(printable);
                result = printable;
            }
            AstNode::Command((cmd, cmd_params)) => {
                let temp = eval_cmd(*cmd, cmd_params, env);
                result = temp.unwrap();
            }
            AstNode::Fun((name, params, body)) => {
                interp_fun(name, params, body, env);
            }
            AstNode::App((name, params)) => {
                result = match interp_app(name, params, &env.clone()) {
                    Ok(evaluated) => evaluated.to_string(),
                    Err(e) => return Err(e)
                }
                // result = interp_app(name, params, &mut env);

            }
            bad_line => return Ok(format!("Invalid line: {:?}", bad_line)),
        };
    }

    Ok(result)
    // Ok("done".to_owned())
}
