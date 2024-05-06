use axum::routing::get;
use interp::interp;
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;
use types::LalaType;

mod commands;
mod interp;
mod matrix;
mod parser;
mod types;

const  RED: &str = "\x1b[31m";
const BLUE: &str = "\x1B[34m";
const DFLT: &str = "\x1B[37m";

#[derive(Debug, serde::Deserialize)]
struct Cell {
    cell_text: String,
}

impl std::fmt::Display for Cell {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Cell {{ cell_text: {} }}", self.cell_text)
    }
}

#[derive(Debug, serde::Serialize)]
struct CellOutput {
    output: String,
}

impl std::fmt::Display for CellOutput {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CellOutput {{ output: {} }}", self.output)
    }
}

async fn on_connect(socket: SocketRef) {
    info!("socket connected: {}{}{}", BLUE, socket.id, DFLT);
    let env: Arc<Mutex<HashMap<String, LalaType>>> = Arc::new(Mutex::new(HashMap::new()));

    let env_clone = Arc::clone(&env);

    socket.on("run", move |s: SocketRef, Data::<Cell>(data)| {
        let mut env = env_clone.lock().unwrap();

        info!("Received message from {}{}{}: {:?}", BLUE, s.id, DFLT, data);

        let input = data.cell_text.leak();

        let ast = match parser::parse(input) {
            Ok(tree) => tree.leak(),
            Err(e) => {
                let output = CellOutput { output: e.to_string() };

                info!("{}Parse error{} {}{}{}: {:?}", RED, DFLT, BLUE, s.id, DFLT, output);
        
                let _ = s.emit("output", output);
                return;
            }
        };

        let response = match interp(ast, Some(&mut *env), true) {
            Ok(interpreted) => interpreted,
            Err(e) => {
                let output = CellOutput { output: e.to_string() };

                info!("{}Error{} {}{}{}: {:?}", RED, DFLT, BLUE, s.id, DFLT, output);
        
                let _ = s.emit("output", output);
                return;
            }
        };

        let output = CellOutput { output: response };

        info!("Sending message to {}{}{}: {:?}", BLUE, s.id, DFLT, output);

        let _ = s.emit("output", output);
    });
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();

    io.ns("/", on_connect);

    let app = axum::Router::new()
        .route(
            "/",
            get(|| async { "This is not the webpage you are looking for..." }),
        )
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(layer),
        );

    info!("Lala Kernel Ready!");

    axum::Server::bind(&"127.0.0.1:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
