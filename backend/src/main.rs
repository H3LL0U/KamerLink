use anyhow::{Result, Context};
use axum::{middleware, Extension};
use axum::routing::{get, Route};
use axum::{ routing::post, Router, };
use axum::extract::State;
use backend::{get_jwks, AppState};
use http::HeaderValue;
use jsonwebtoken::jwk::JwkSet;
use mongodb::options::ClientOptions;
use std::fs;
use std::env;
use std::sync::Arc;
use utoipa::{OpenApi};
use utoipa_swagger_ui::SwaggerUi;
use tower_http::cors::{CorsLayer, Any}; 
use dotenv::dotenv;
pub mod rng;
pub mod routes;
pub mod validation;
pub mod database;
use routes::*;
use routes::ApiDoc;
use validation::token_validation_middleware;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    middleware::{ Next},
    extract::{Request},

};
use mongodb::{self, Client, Database};
use tower_http::limit::RequestBodyLimitLayer;
use crate::routes::api::post::create_post;
use crate::routes::post::retreve_posts;
// /gamble



#[tokio::main]
pub async fn main() {

    dotenv().ok(); //auto set the .env
    dbg!("generate openapi");
    //Generate openapi.json for the frontend
    let openapi = ApiDoc::openapi();
    fs::write("openapi.json", openapi.to_json().unwrap())
        .expect("Failed to write openapi.json");
    println!("openapi.json generated.");

    if env::args().any(|arg| arg == "-apigen") {
        println!("The backend server is not run");
        return;
    }
    // ALLOWED ORIGINS
    let origins = [
        "http://localhost:5173".parse::<HeaderValue>().unwrap(), //local url
        "https://infrastem.vercel.app/".parse::<HeaderValue>().unwrap(), // production url
    
    ];

    // MONGODB CONNECTION
    
    let db = Arc::new(Client::with_uri_str(env::var("MONGO_DB").expect("No MONGO_DB set")).await.expect("Error connecting to db").database("kamerlink"));

    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods(Any)
        .allow_headers(Any);



    let state = AppState {
            jwks: Arc::new(get_jwks().await.expect("Error setting app state")),
            db: db
        };    




    let protected_routes: Router = Router::new()
        .route("/gamble", post(gamble))
        .route("/post", post(create_post))
        .route("/post", get(retreve_posts))
        
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            token_validation_middleware,
        ));
        //.layer(Extension(state.clone())); // 


    // Public routes (empty for now)
    let public_routes: Router = Router::new();

    let app = Router::new()
        .nest("/api", protected_routes) // all /api/* routes are protected
        .merge(public_routes)           // all public routes here
        .merge(SwaggerUi::new("/docs").url("/api-doc/openapi.json", openapi)) // Swagger
        .layer(cors)
        .layer(RequestBodyLimitLayer::new(25 * 1024 * 1024))
        .layer(Extension(state.clone())); // <-- shared state for all routes;; // 25 MB max
        


        
    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000")
        .await
        .expect("Failed to bind to port");
    println!("🚀 Running at http://localhost:5000/docs");
    axum::serve(listener,app ).await.unwrap();
}
