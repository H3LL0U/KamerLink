use anyhow::{Context, Result};
use jsonwebtoken::jwk::JwkSet;
pub mod utils;
use std::env;
use std::sync::Arc;

pub mod database;
pub mod errors;
pub mod routes;
pub mod routes_builder;
pub mod validation;
use mongodb::{self, ClientSession, Database};

// /gamble

pub async fn get_jwks() -> Result<JwkSet> {
    let issuer = env::var("ISSUER").context("Environment variable ISSUER is not set")?;

    let jwks_url = format!("{}/.well-known/jwks.json", issuer.trim_end_matches('/'));

    let jwks: JwkSet = reqwest::get(&jwks_url)
        .await
        .context("Failed to fetch JWKS from Auth0")?
        .json()
        .await
        .context("Failed to deserialize JWKS response")?;

    Ok(jwks)
}

#[derive(Clone, Debug)]
pub struct AppState {
    pub jwks: Arc<JwkSet>,
    pub db: Arc<Database>,
    pub session: Arc<ClientSession>,
}
