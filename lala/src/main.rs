use axum::routing::get;
use socketioxide::{extract::{Data, SocketRef}, SocketIo};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;
use std::collections::HashMap;
use interp::interp;
use types::LalaType;

mod commands;
mod interp;
mod parser;
mod matrix;
mod types;

#[derive(Debug, serde::Deserialize)]
struct Cell {
    auth: String,
    cell_text: String,
}

impl std::fmt::Display for Cell {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Cell {{ cell_text: {} , auth: {} }}", self.cell_text, self.auth)
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
    info!("socket connected: {}", socket.id);
    let mut env: HashMap<String, LalaType> = HashMap::new();

    socket.on("run", move |s: SocketRef, Data::<Cell>(data)| {
        info!("Received message from {}: {:?}", s.id, data);

        let input = data.cell_text.trim();

        let _ = data.auth.trim();

        let ast = parser::parse(input).unwrap();
        let response = interp(&ast, Some(&mut env), true).unwrap();

        let output = CellOutput {
            output: response
        };

        info!("Sending message to {}: {:?}", s.id, output);

        let _ = s.emit("output", output);
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();

    io.ns("/", on_connect);

    let app = axum::Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(layer),
        );

    info!("Lala Kernel Starting...");

    axum::Server::bind(&"127.0.0.1:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await?;

    Ok(())
}