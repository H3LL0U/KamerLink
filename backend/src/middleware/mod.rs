use crate::{AppState, database::schemas::user::*};
use anyhow::{Context, Result, anyhow};
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::{IntoResponse, Response},
};
use http::{HeaderValue, StatusCode};
use jsonwebtoken::{self, DecodingKey, TokenData, Validation, decode, decode_header, jwk::JwkSet};
use mongodb::{
    Database,
    bson::{self, doc},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{env, sync::Arc};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}

///
/// Validates the token, checks if the email of the user is verified and adds it to the database if it is.
///
///
/// The goal of this function is to only allow users with specific emails that are already specified in the database to enter while filtering all the remaining users.
/// Also makes sure that the users that send the request always have their email validated
///
pub enum CheckUserError {
    Anyhow(anyhow::Error),
    Banned(Option<User>),
}
pub async fn check_user(
    token: &HeaderValue,
    db: Arc<Database>,
    jwks: Arc<JwkSet>,
) -> Result<TokenData<Value>, CheckUserError> {
    // get the user sub
    let parts: Vec<&str>;
    let token_data: TokenData<Value> = match validate_token(token, jwks) {
        Ok(k) => k,
        Err(e) => return Err(CheckUserError::Anyhow(anyhow!(e))),
    };

    if let Some(sub) = token_data.claims.get("sub").and_then(|v| v.as_str()) {
        parts = sub.split('|').collect();
        if parts.len() != 2 {
            return Err(CheckUserError::Anyhow(anyhow!("invalid sub format")));
        }
    } else {
        return Err(CheckUserError::Anyhow(anyhow!("Bad request")));
    }
    // Split the sub into type|sub

    let user_sub = UserSub {
        r#type: parts[0].to_string(),
        sub: parts[1].to_string(),
    };
    let collection = db.collection::<User>("users");

    // Build the query using $elemMatch
    // Checking for an existing user sub (with validated email)
    let filter = doc! {
        "is_validated":true,
        "user_subs": {
            "$elemMatch": {
                "type": &user_sub.r#type,
                "sub": &user_sub.sub
            }
        }
    };

    let user = match collection.find_one(filter).await {
        Ok(k) => k,
        Err(e) => return Err(CheckUserError::Anyhow(anyhow!("Database error: {}", e))),
    };

    let is_banned = user
        .as_ref()
        .and_then(|u| u.ban_status.as_ref())
        .map(|b| b.is_active())
        .unwrap_or(false);
    if is_banned {
        return Err(CheckUserError::Banned(user));
    }

    // if no user with the sub exists get the email to validate further

    if user.is_none() {
        // Extract the 'aud' claim array
        let aud_array = token_data
            .claims
            .get("aud")
            .ok_or(anyhow!("aud claim missing"))
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?
            .as_array()
            .ok_or(anyhow!("aud claim is not an array"))
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?;

        let userinfo_url = aud_array
            .get(1)
            .ok_or(anyhow!("aud array does not have 2nd element"))
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?
            .as_str()
            .ok_or(anyhow!("2nd aud element is not a string"))
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?;

        // Fetch the user info from Auth0
        let client = reqwest::Client::new();
        let user_info: reqwest::Response = match client
            .get(userinfo_url)
            .bearer_auth(
                token
                    .to_str()
                    .with_context(|| "error decoding header")
                    .map(|raw| raw.strip_prefix("Bearer ").unwrap_or(raw))
                    .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?,
            )
            .send()
            .await
        {
            Ok(k) => k,
            Err(e) => return Err(CheckUserError::Anyhow(anyhow!(e))),
        };

        let response_json: Value = match user_info.json().await {
            Ok(k) => k,
            Err(e) => return Err(CheckUserError::Anyhow(anyhow!(e))),
        };

        // Check if the email is already verified
        let email_verified = response_json
            .get("email_verified")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if !email_verified {
            return Err(CheckUserError::Anyhow(anyhow!("Email not verified")));
        }
        // checking for already existing email
        let email = response_json
            .get("email")
            .and_then(|v| v.as_str())
            .ok_or(anyhow!("email not found in user info"))
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?;

        let filter = doc! { "email": email };

        let count = collection
            .count_documents(filter.clone())
            .await
            .map_err(|e| CheckUserError::Anyhow(anyhow!(e)))?;

        // If no email found raise an error since it is not allowed
        let user_sub_doc = match bson::to_document(&user_sub) {
            Ok(k) => k,
            Err(e) => return Err(CheckUserError::Anyhow(anyhow!(e))),
        };
        if count == 0 {
            return Err(CheckUserError::Anyhow(anyhow!("Email not allowed")));
        } else {
            let update = doc! {
                "$set": {
                    "is_validated": true
                },
                "$push": {
                    "user_subs": user_sub_doc
                }
            };
            match collection.update_one(filter, update).await {
                Ok(k) => k,
                Err(e) => return Err(CheckUserError::Anyhow(anyhow!(e))),
            };
        }
    }

    Ok(token_data)
}

fn validate_token(token: &HeaderValue, jwks: Arc<JwkSet>) -> Result<TokenData<Value>> {
    let token_str = token
        .to_str()
        .with_context(|| "error decoding header")?
        .trim_start_matches("Bearer ");
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

// Different behaviours for the middleware
pub trait TokenBehavior: 'static + Send + Sync {
    type Output: 'static + Send + Sync + Clone;

    fn wrap_sub(sub: &str) -> Self::Output;
    fn ensure_extension_present(_req: &mut Request, _default_value: Option<String>) {}
    fn handle_error(is_banned: bool, sub_missing: bool) -> Option<Response>;
}
pub struct Regular;
// Will propagate the request no matter what. Even if the user is invalid

impl TokenBehavior for Regular {
    type Output = Option<String>;

    fn wrap_sub(sub: &str) -> Self::Output {
        Some(sub.to_string())
    }
    fn ensure_extension_present(req: &mut Request, default_value: Option<String>) {
        if req.extensions().get::<Option<String>>().is_none() {
            req.extensions_mut().insert::<Option<String>>(default_value);
        }
    }
    fn handle_error(_is_banned: bool, _sub_missing: bool) -> Option<Response> {
        None
    }
}

pub struct Strict;
// Will propagate the request only if the user is valid

impl TokenBehavior for Strict {
    type Output = String;

    fn wrap_sub(sub: &str) -> Self::Output {
        sub.to_string()
    }

    fn handle_error(is_banned: bool, sub_missing: bool) -> Option<Response> {
        if is_banned {
            Some(StatusCode::LOCKED.into_response())
        } else if sub_missing {
            Some(StatusCode::FORBIDDEN.into_response())
        } else {
            None
        }
    }
}

pub async fn token_validation_middleware<T: TokenBehavior>(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    let mut is_banned = false;
    let mut sub_missing = false;
    let mut user: Option<User> = None;
    match request.headers().get("Authorization") {
        Some(token) => match check_user(token, state.db, state.jwks.clone()).await {
            Ok(data) => {
                if let Some(sub) = data.claims.get("sub").and_then(|v| v.as_str()) {
                    let value: T::Output = T::wrap_sub(sub);
                    request.extensions_mut().insert::<T::Output>(value);
                } else {
                    sub_missing = true;
                }
            }
            Err(e) => match e {
                CheckUserError::Banned(banned_user) => {
                    is_banned = true;
                    user = banned_user;
                }
                CheckUserError::Anyhow(_) => sub_missing = true,
            },
        },
        None => sub_missing = true,
    }

    T::ensure_extension_present(
        &mut request,
        user.and_then(|u| u.user_subs.first().map(|sub| sub.to_string())),
    );

    if let Some(resp) = T::handle_error(is_banned, sub_missing) {
        return resp;
    }

    next.run(request).await.into_response()
}

pub async fn strict_except_get_middleware(
    State(state): State<AppState>,
    req: Request,
    next: Next,
) -> Response {
    if req.method() == http::Method::GET {
        token_validation_middleware::<Regular>(axum::extract::State(state), req, next).await
    } else {
        // Strict for non-GETs
        token_validation_middleware::<Strict>(axum::extract::State(state), req, next).await
    }
}
