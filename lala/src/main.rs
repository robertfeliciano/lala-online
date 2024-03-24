use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use interp::interp;
use types::LalaType;

mod commands;
mod interp;
mod parser;
mod matrix;
mod types;

fn handle_client(mut stream: TcpStream) -> Result<(), anyhow::Error>{
    let mut buffer = [0; 1024];
    // initialize env for client
    let mut env: HashMap<String, LalaType> = HashMap::new();
    loop {
        match stream.read(&mut buffer) {
            Ok(bytes_read) => {
                if bytes_read == 0 {
                    break;
                }

                // convert bytes to string
                let received_str = String::from_utf8_lossy(&buffer[..bytes_read]);

                let input = received_str.trim();
                let ast = parser::parse(input)?;
                let response = interp(&ast, Some(&mut env), true)?;

                // send result
                stream.write_all(response.as_bytes()).unwrap();
            }
            Err(_) => {
                break;
            }
        }
    }
    Ok(())
}

fn find_available_port(start: u16) -> u16{
    let mut ret_port = start;
    loop {
        match TcpListener::bind(("127.0.0.1", ret_port)) {
            Ok(_) => {
                // Port is not busy, we were able to bind successfully
                return ret_port;
            }
            Err(_) => {
                ret_port += 1;
                continue;
            }
        }
    }
}

fn main() {
    let port = find_available_port(8080);
    let listener = TcpListener::bind(("127.0.0.1", port)).expect("Failed to bind address");
    println!("Lala kernel listening on port {port}...");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                if let Ok(peer_addr) = stream.peer_addr() {
                    println!("New client connected from {}.", peer_addr);
                } else {
                    println!("Failed to get client address.");
                }
                thread::spawn(move || {
                    handle_client(stream)
                });
            }
            Err(e) => {
                eprintln!("Error accepting connection: {}", e);
            }
        }
    }
}
