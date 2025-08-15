use axum::routing::get;
use axum::{ routing::post, Router, };
use http::HeaderValue;
use std::fs;
use std::env;
use utoipa::{OpenApi};
use utoipa_swagger_ui::SwaggerUi;
use tower_http::cors::{CorsLayer, Any}; 
use dotenv::dotenv;
pub mod rng;
pub mod routes;
pub mod validation;
use routes::*;
use routes::ApiDoc;
// /gamble


#[tokio::main]
async fn main() {

    dotenv().ok(); //auto set the .env
    
    let openapi = ApiDoc::openapi();
    fs::write("openapi.json", openapi.to_json().unwrap())
        .expect("Failed to write openapi.json");
    println!("openapi.json generated.");

    if env::args().any(|arg| arg == "-apigen") {
        println!("The backend server is not run");
        return;
    }
    //ALLOWED ORIGINS
    let origins = [
        "http://localhost:5173".parse::<HeaderValue>().unwrap(), //local url
        "https://infrastem.vercel.app/".parse::<HeaderValue>().unwrap(), // production url
    ];

    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/gamble", post(gamble))
        .merge(SwaggerUi::new("/docs").url("/api-doc/openapi.json", openapi))
        .layer(cors);

    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000")
        .await
        .expect("Failed to bind to port");
    println!("🚀 Running at http://localhost:5000/docs");
    axum::serve(listener, app).await.unwrap();
}
