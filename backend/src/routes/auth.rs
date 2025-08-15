use axum::{
    extract::{Query},
    response::{IntoResponse, Redirect},
    http::StatusCode,
    Json
    
};


use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};
use std::env;
use utoipa::ToSchema;
use urlencoding; 
#[derive(Deserialize)]
pub struct AuthCallbackQuery {
    pub code: String,
    pub state: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct AuthResponse {
    access_token: String,
    id_token: String,
    expires_in: u64,
    token_type: String,
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct Auth0Code {
    code: String
}

#[utoipa::path(
    get,
    path = "/auth/login",
    responses(
        (status = 302, description = "Redirects to Auth0 login page and then redirects to the call back uri with a temporary code")
    )
)]
pub async fn auth_login() -> impl IntoResponse {
    let auth0_domain = env::var("AUTH0_DOMAIN").expect("AUTH0_DOMAIN is not set");
    let client_id = env::var("AUTH0_CLIENT_ID").expect("AUTH0_CLIENT_ID is not set");
    let redirect_uri = env::var("CALLBACK_URI").expect("CALLBACK_URI is not set");
    let audience = env::var("AUTH0_AUDIENCE").unwrap_or_default();


    // Build the authorization URL
    let mut auth_url = format!(
        "https://{}/authorize?response_type=code&client_id={}&redirect_uri={}&scope=openid profile email",
        auth0_domain,
        client_id,
        urlencoding::encode(&redirect_uri)
    );

    if !audience.is_empty() {
        auth_url += &format!("&audience={}", urlencoding::encode(&audience));
    }

    // Redirect user to Auth0 login page
    Redirect::temporary(&auth_url)
}

#[utoipa::path(
    post,
    path = "/auth/get_token",
    params(
        ("code" = String, Path, description = "Authorization code from Auth0"),
    ),
    description = "used to retrieve a Bearer Authorization token from a temporary code",
    responses(
        (status = 200, description = "Auth successful", body = AuthResponse),
        (status = 400, description = "Bad request"),
        (status = 303, description = "Redirects back to the homepage")
    )
)]
pub async fn get_token(
    mut jar: CookieJar,
    Json(input): Json<Auth0Code>,
) -> impl IntoResponse {
    let auth0_domain = env::var("AUTH0_DOMAIN").expect("AUTH0_DOMAIN is not set");
    let client_id = env::var("AUTH0_CLIENT_ID").expect("AUTH0_CLIENT_ID is not set");
    let client_secret = env::var("AUTH0_CLIENT_SECRET").expect("AUTH0_CLIENT_SECRET is not set");
    let redirect_uri = env::var("CALLBACK_URI").expect("CALLBACK_URI is not set");
    let return_uri = env::var("RETURN_URI").expect("RETURN_URI is not set");

    let client = reqwest::Client::new();

    let token_params = [
        ("grant_type", "authorization_code"),
        ("client_id", &client_id),
        ("client_secret", &client_secret),
        ("code", &input.code),
        ("redirect_uri", &redirect_uri), // Must match exactly the redirect_uri used in /auth/login
    ];

    let url = format!("https://{}/oauth/token", auth0_domain);

    let res = client
        .post(&url)
        .form(&token_params)
        .send()
        .await;

    match res {
        Ok(response) => {
            if response.status().is_success() {
                let tokens: AuthResponse = response.json().await.unwrap();

                
            
                
                
                (Json(tokens)).into_response()
            } else {
                (
                    StatusCode::BAD_REQUEST,
                    format!("Auth0 error: {}", response.text().await.unwrap_or_default()),
                )
                    .into_response()
            }
        }
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Request to Auth0 failed: {}", err),
        )
            .into_response(),
    }
}