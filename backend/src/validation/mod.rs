use jsonwebtoken::{decode, decode_header, DecodingKey, Validation, Algorithm};
use serde::{Deserialize};
use reqwest::Client;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    aud: String,
    iss: String,
    // Add other claims you want to check
}

#[derive(Debug, Deserialize)]
struct Jwks {
    keys: Vec<Jwk>,
}

#[derive(Debug, Deserialize)]
struct Jwk {
    kid: String,
    kty: String,
    n: String,
    e: String,
    alg: String,
    #[serde(rename = "use")]
    use_: String,
}

impl Jwks {
    fn find(&self, kid: &str) -> Option<&Jwk> {
        self.keys.iter().find(|jwk| jwk.kid == kid)
    }
}

#[derive(Debug)]
pub enum ServiceError {
    JWKSFetchError,
    InvalidToken,
    KeyNotFound,
    ReqwestError(reqwest::Error),
    JwtError(jsonwebtoken::errors::Error),
    EnvVarError(std::env::VarError),
}

impl From<reqwest::Error> for ServiceError {
    fn from(err: reqwest::Error) -> Self {
        ServiceError::ReqwestError(err)
    }
}

impl From<jsonwebtoken::errors::Error> for ServiceError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        ServiceError::JwtError(err)
    }
}

impl From<std::env::VarError> for ServiceError {
    fn from(err: std::env::VarError) -> Self {
        ServiceError::EnvVarError(err)
    }
}

async fn fetch_jwks(jwks_url: &str) -> Result<Jwks, ServiceError> {
    let client = Client::new();
    let res = client.get(jwks_url).send().await?;
    let jwks = res.json::<Jwks>().await?;
    Ok(jwks)
}

fn token_kid(token: &str) -> Result<Option<String>, jsonwebtoken::errors::Error> {
    let header = decode_header(token)?;
    Ok(header.kid)
}

pub async fn validate_token(token:&str ) -> Result<bool, ServiceError> {
    let authority = std::env::var("AUTHORITY")?;
    let jwks_url = format!("{}{}", authority, "/.well-known/jwks.json");
    let jwks = fetch_jwks(&jwks_url).await?;

    let kid = token_kid(token)?.ok_or(ServiceError::InvalidToken)?;

    let jwk = jwks.find(&kid).ok_or(ServiceError::KeyNotFound)?;

    // Construct the decoding key from the JWKS RSA public key
    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[&authority]);

    let token_data = decode::<Claims>(token, &decoding_key, &validation)?;

    
    Ok(true)
}
