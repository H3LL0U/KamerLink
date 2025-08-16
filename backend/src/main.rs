use anyhow::{Result, Context};
use axum::middleware;
use axum::routing::{get, Route};
use axum::{ routing::post, Router, };
use axum::extract::State;
use http::HeaderValue;
use jsonwebtoken::jwk::JwkSet;
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
use routes::*;
use routes::ApiDoc;
use validation::token_validation_middleware;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    middleware::{ Next},
    extract::{Request},
};
// /gamble


pub async fn get_jwks() -> Result<JwkSet> {
    let issuer = env::var("ISSUER")
        .context("Environment variable ISSUER is not set")?;

    let jwks_url = format!("{}/.well-known/jwks.json", issuer.trim_end_matches('/'));

    let jwks: JwkSet = reqwest::get(&jwks_url)
        .await
        .context("Failed to fetch JWKS from Auth0")?
        .json()
        .await
        .context("Failed to deserialize JWKS response")?;

    Ok(jwks)
}

#[derive(Clone)]
pub struct AppState {
    jwks: Arc<JwkSet>,
    }



#[tokio::main]
async fn main() {

    dotenv().ok(); //auto set the .env
    
    //Generate openapi.json for the frontend
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



    let state = AppState {
            jwks: Arc::new(get_jwks().await.expect("Error setting app state"))
        };    




    let protected_routes: Router = Router::new()
        .route("/gamble", post(gamble))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            token_validation_middleware,
        ));

    // Public routes (empty for now)
    let public_routes: Router = Router::new();

    // Combine everything
    let app = Router::new()
        .nest("/api", protected_routes) // all /api/* routes are protected
        .merge(public_routes)           // all public routes here
        .merge(SwaggerUi::new("/docs").url("/api-doc/openapi.json", openapi)) // Swagger
        .layer(cors)
        .with_state(());


        
    // Build router
    /* 
    let protected_route:Router = Router::new()
        .route("/gamble", post(gamble)
        .route_layer(middleware::from_fn_with_state(state.clone(),token_validation_middleware))
    )        
        .merge(SwaggerUi::new("/docs").url("/api-doc/openapi.json", openapi))
        .layer(cors)

        .with_state(state);
    */
    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5000")
        .await
        .expect("Failed to bind to port");
    println!("🚀 Running at http://localhost:5000/docs");
    axum::serve(listener,app ).await.unwrap();
}
