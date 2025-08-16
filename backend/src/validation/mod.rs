use anyhow::{anyhow, Context, Result};
use axum::{extract::{Request, State}, middleware::Next, response::{self, IntoResponse, Response}};
use http::{HeaderValue, StatusCode};
use jsonwebtoken::{self, decode, decode_header, jwk::JwkSet, DecodingKey, TokenData, Validation};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{env, sync::Arc};

use crate::AppState;


#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}


fn validate_token(token: &HeaderValue, jwks: Arc<JwkSet>) -> Result<TokenData<Value>>{
    
    let token_str = token.to_str().with_context( || "error decoding header")?.trim_start_matches("Bearer ");
    let header = decode_header(&token_str).with_context(|| "Error decoding header")?;
    
    let kid = &header.kid.ok_or(anyhow!("missing kid"))?;
    let jwk = jwks.find(kid).ok_or(anyhow!("could not find jwk"))?;
    
    let decoding_key = DecodingKey::from_jwk(jwk).with_context(|| "Error getting key")?;

    let mut validation = Validation::new(header.alg);
    validation.set_audience(&[env::var("AUDIENCE").expect("No AUDIENCE env variable set")]);
    validation.set_issuer(&[env::var("ISSUER").expect("No ISSUER env variable set")]);
    // optional leeway for clock skew:
    validation.leeway = 30;

    let data = decode::<Value>(&token_str, &decoding_key, &validation)?;
    
    Ok(data)
}

pub async fn token_validation_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    match request.headers().get("Authorization") {
        Some(token) => {
            match validate_token(token, state.jwks.clone()) {
                Ok(data) => {
                    // Extract "sub" from claims
                    if let Some(sub) = data.claims.get("sub").and_then(|v| v.as_str()) {
                        request.extensions_mut().insert(sub.to_string());
                    } else {
                        return StatusCode::FORBIDDEN.into_response();
                    }
                }
                Err(e) => {
                    dbg!(format!("{}", e));
                    return StatusCode::FORBIDDEN.into_response();
                }
            };

            next.run(request).await.into_response()
        }
        None => StatusCode::FORBIDDEN.into_response(),
    }
}
