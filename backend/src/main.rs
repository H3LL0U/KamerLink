use anyhow::{Context, Result};
use axum::Extension;
use axum::extract::State;
use axum::routing::{Route, get};
use axum::{Router, routing::post};
use backend::routes::post::comment::create_comment;
use backend::routes::post::like::like_post;
use backend::routes::post::points::check_points;
use backend::{AppState, get_jwks};
use dotenv::dotenv;
use http::HeaderValue;
use jsonwebtoken::jwk::JwkSet;
use mongodb::options::ClientOptions;
use std::env;
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
pub mod database;
pub mod errors;
pub mod middleware;
pub mod routes;
pub mod routes_builder;
pub mod test_utils;
pub mod utils;
use crate::routes::api::post::create_post;
use crate::routes::post::comment::retrieve_comments;
use crate::routes::post::points::spend_points;
use crate::routes::post::retrieve_posts;
use crate::routes::user::retrieve_users;
use crate::routes_builder::{build_private_routes, build_public_routes};
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use middleware::token_validation_middleware;
use mongodb::{self, Client, Database};
use routes::ApiDoc;
use routes::*;
use tower_http::limit::RequestBodyLimitLayer;
use utils::reset;
#[tokio::main]
pub async fn main() {
    dotenv().ok(); //auto set the .env
    dbg!("generate openapi");
    //Generate openapi.json for the frontend
    let openapi = ApiDoc::openapi();
    fs::write("openapi.json", openapi.to_json().unwrap()).expect("Failed to write openapi.json");
    dbg!("openapi.json generated.");

    if env::args().any(|arg| arg == "-apigen") {
        dbg!("The backend server is not run");
        return;
    }
    // ALLOWED ORIGINS
    let origins = [
        "http://localhost:5173".parse::<HeaderValue>().unwrap(), //local url
        "http://192.168.2.11:5173".parse::<HeaderValue>().unwrap(), //local url (main pc)
        "https://kamerlink.vercel.app"
            .parse::<HeaderValue>()
            .unwrap(), // production url
        "https://kamer-link.nl".parse::<HeaderValue>().unwrap(), //second production url
        "https://www.kamer-link.nl".parse::<HeaderValue>().unwrap(), //third production url
    ];

    // MONGODB CONNECTION

    let client = Arc::new(
        Client::with_uri_str(env::var("MONGO_DB").expect("No MONGO_DB set"))
            .await
            .expect("Error connecting to db"),
    );
    let db = Arc::new(client.database("kamerlink"));
    let session = Arc::new(
        client
            .start_session()
            .await
            .expect("Could not initialize a session"),
    );
    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods(Any)
        .allow_headers(Any);

    let state = AppState {
        jwks: Arc::new(get_jwks().await.expect("Error setting app state")),
        db: db.clone(),
        session: session,
    };

    // schedule the reset
    let cur_reset_time = reset::get_cur_reset_time(db.clone())
        .await
        .expect("Error inserting new reset time");

    let when_to_reset = cur_reset_time.time;
    tokio::spawn(async move {
        reset::schedule_reset(when_to_reset, db.clone()).await;
    });

    let protected_routes: Router = build_private_routes(&state);
    //.layer(Extension(state.clone())); //

    // Public routes (empty for now)
    let public_routes: Router = build_public_routes();

    let app = Router::new()
        .nest("/api", protected_routes) // all /api/* routes are protected
        .merge(public_routes) // all public routes here
        .merge(SwaggerUi::new("/docs").url("/api-doc/openapi.json", openapi)) // Swagger
        .layer(cors)
        .layer(RequestBodyLimitLayer::new(25 * 1024 * 1024))
        .layer(Extension(state.clone())); // <-- shared state for all routes;; // 25 MB max

    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000")
        .await
        .expect("Failed to bind to port");
    println!("Running at http://localhost:5000/docs");
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}
