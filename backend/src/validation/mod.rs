use anyhow::{anyhow, Context, Result};
use axum::{extract::{Request, State}, middleware::Next, response::{self, IntoResponse, Response}};
use http::{HeaderValue, StatusCode};
use jsonwebtoken::{self, decode, decode_header, jwk::JwkSet, DecodingKey, TokenData, Validation};
use mongodb::{bson::{self, doc}, Database};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{env, sync::Arc};
use crate::{database::schemas::user::*, AppState};



#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}


///
/// Validates the token, checks if the email of the user is veryfied and adds it to the database if it is.
///
/// 
/// The goal of this function is to only allow users with specific emails that are already specified in the database to enter while filtering all the remaining users.
/// Also makes sure that the users that send the request always have their email validated
/// 
pub async fn check_user(
    token: &HeaderValue,
    db: Arc<Database>,
    jwks: Arc<JwkSet>
) -> Result<TokenData<Value>> {

    // get the user sub
    let parts: Vec<&str>;
    let token_data: TokenData<Value> = validate_token(token, jwks)?;
    
    if let Some(sub) = token_data.claims.get("sub").and_then(|v| v.as_str()){
        parts = sub.split('|').collect();
        if parts.len() != 2 {
            return Err(anyhow!("invalid sub format"));
    }
    }
    else{
        return Err(anyhow!("Bad request"));
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

    // Count matching documents
    let count = collection.count_documents(filter).await?;

    // if no user with the sub exists get the email to validate further
    
    if count == 0 {
        // Extract the 'aud' claim array
        let aud_array = token_data
            .claims
            .get("aud")
            .ok_or(anyhow!("aud claim missing"))?
            .as_array()
            .ok_or(anyhow!("aud claim is not an array"))?;

        
        let userinfo_url = aud_array
            .get(1)
            .ok_or(anyhow!("aud array does not have 2nd element"))?
            .as_str()
            .ok_or(anyhow!("2nd aud element is not a string"))?;
            
        // Fetch the user info from Auth0
        let client = reqwest::Client::new();
        let user_info:reqwest::Response = client
            .get(userinfo_url)
            .bearer_auth(
                token
                .to_str()
                .with_context(|| "error decoding header")
                .map(|raw| raw.strip_prefix("Bearer ").unwrap_or(raw))?
            )
            .send()
            .await?; // error decoding response body

        let response_json:Value =             user_info.json().await?;

        // Check if the email is already verified
        let email_verified = response_json
            .get("email_verified")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if !email_verified {
            return Err(anyhow!("Email not verified"));
        }
        // checking for already existing email
        let email = response_json
            .get("email")
            .and_then(|v| v.as_str())
            .ok_or(anyhow!("email not found in user info"))?;
        
        
        
        

        let filter = doc! { "email": email };


        let count = collection.count_documents(filter.clone()).await?;


        // If no email found raise an error since it is not allowed

        if count == 0{
        
        return  Err(anyhow!("Email not allowed"));
        
        }
    else {
        let update = doc! {
            "$set": {
                "is_validated": true
            },
            "$push": {
                "user_subs": bson::to_document(&user_sub)?
            }
        };
        collection.update_one(filter, update).await?;
    }
        

    }

    Ok(token_data)
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
            match check_user(token, state.db, state.jwks.clone()).await {
                Ok(data) => {
                    // Extract "sub" from claims
                    
                    if let Some(sub) = data.claims.get("sub").and_then(|v| v.as_str()) {
                        request.extensions_mut().insert(sub.to_string());
                        

                        //adding a new user to the db if doesnt exist



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
