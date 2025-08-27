use axum::{extract::State, response::{IntoResponse, Response}, Json};
use axum_extra::extract::cookie::CookieJar;
use axum::http::StatusCode;
use utoipa::openapi::security::{SecurityScheme, HttpAuthScheme};

use serde::{Deserialize, Serialize};
use utoipa::{OpenApi, ToSchema};


use crate::{rng,};

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
    path = "/api/gamble",
    request_body(
        content_type = "application/json",
        description = "Type of gamble",
        content = Gamble
    ),
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Generates a list of numbers from 1 to 7", body = GambleResults),
        (status = 401, description = "Unauthorized - missing or invalid token")
    )
)]
pub async fn gamble(Json(input): Json<Gamble>) -> Response {
    let result = match input.gamble_type {
        GambleTypes::Slots => GambleResults {
            slots: Some(rng::generate_slots()),
        },
    };

    Json(result).into_response()
}
