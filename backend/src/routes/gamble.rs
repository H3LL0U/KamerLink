use axum::{response::{IntoResponse, Response}, Json};
use axum_extra::extract::cookie::CookieJar;
use axum::http::StatusCode;


use serde::{Deserialize, Serialize};
use utoipa::{OpenApi, ToSchema};


use crate::{rng, validation::validate_token};

// SCHEMAS
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct Gamble {

    pub(crate) gamble_type: GambleTypes
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub enum GambleTypes{
    Slots
 }



#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct GambleResults{
    pub(crate) slots: Option<Vec<u8>>
}




// /gamble
#[utoipa::path(
    post,
    path = "/gamble",
    responses(
        (status = 200, description = "generates a list of numbers from 1 to 7", body = GambleResults),
        (status = 401, description = "Not authorized")
    )
)]
pub async fn gamble(jar: CookieJar, Json(input): Json<Gamble>) -> Response {
    // Extract access_token cookie
    dbg!(&jar);
    let access_token = match jar.get("access_token") {
        Some(cookie) => cookie.value().to_string(),
        None => return (StatusCode::UNAUTHORIZED, "Missing access token").into_response(),
    };

    // Validate the token
    if let Err(_) = validate_token(&access_token).await {
        return (StatusCode::UNAUTHORIZED, "Invalid token").into_response();
    }

    // Proceed with the gamble
    let result = match input.gamble_type {
        GambleTypes::Slots => GambleResults {
            slots: Some(rng::generate_slots()),
        },
    };

    Json(result).into_response()
}
