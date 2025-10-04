use crate::{
    AppState,
    database::schemas::{post::KamerlinkPost, user::User},
    routes::request_builder::toggle_like_generic,
};
use axum::{
    Extension, Json,
    response::{IntoResponse, Response},
};
use http::StatusCode;
use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct LikePost {
    post_id: String,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub enum LikeStatus {
    Like,
    Unlike,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct ResponseLikePost {
    status: LikeStatus,
}

#[utoipa::path(
    post,
    path = "/api/post/like",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Toggles the like/unlike under a post", body = ResponseLikePost),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = LikePost
)]
#[axum::debug_handler]
pub async fn like_post(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<LikePost>,
) -> Response {
    let result = toggle_like_generic(sub.as_str(), &state, &input.post_id, "posts", "likes").await;

    match result {
        Ok(true) => {
            // Now liked
            Json(ResponseLikePost {
                status: LikeStatus::Like,
            })
            .into_response()
        }
        Ok(false) => {
            // Now unliked
            Json(ResponseLikePost {
                status: LikeStatus::Unlike,
            })
            .into_response()
        }
        Err(e) => e.into_response(),
    }
}
