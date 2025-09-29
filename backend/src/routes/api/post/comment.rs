use crate::database::schemas::post::{Comment, CommentBuilder, CommentDraft};
use crate::database::schemas::user;
use crate::routes::request_builder::{
    PaginatedResponse, RetrieveBy, RetrievePaginated, retrieve_items,
};
use crate::{
    AppState,
    database::schemas::{post::KamerlinkPost, user::User},
};
use axum::{
    Extension, Json,
    response::{IntoResponse, Response},
};
use axum_extra::extract::Query;
use chrono::Utc;
use http::StatusCode;
use mongodb::bson::Document;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::results::InsertOneResult;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::{IntoParams, ToSchema};

#[utoipa::path(
    post,
    path = "/api/post/comment",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Adds a comment to a post (returns a comment id)", body = String),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = CommentDraft
)]
pub async fn create_comment(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<CommentDraft>,
) -> Response {
    let collection = state.db.collection::<Comment>("comments");
    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let comment = match CommentBuilder::default()
        .created_at(Utc::now().to_rfc3339())
        .user_id(user_id.to_hex())
        .likes(0)
        .message(input.message)
        .post_id(input.post_id)
        .build()
    {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let comment_id = match collection.insert_one(comment).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    let id = match comment_id.inserted_id.as_object_id() {
        Some(k) => k,
        None => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    return Json(id.to_hex()).into_response();
}

#[derive(Deserialize, Serialize, IntoParams)]
pub struct RetrieveComment {
    #[param(inline)]
    pub retrieve_type: RetrievePaginated,

    pub post_id: String,
}

#[utoipa::path(
    get,
    path = "/api/post/comment",
    responses(
        (status = 200, description = "Retrieves posts", body = PaginatedResponse<Comment>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(RetrieveComment),


    description = "Retrieves 5 posts"
)]
pub async fn retrieve_comments(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrieveComment>,
) -> Response {
    let comment_id = match ObjectId::from_str(&req.post_id) {
        Ok(k) => k,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };

    retrieve_items::<Comment>(
        Extension(state),
        Extension(sub),
        Query(req.retrieve_type),
        "comments",
        &[
            RetrieveBy::MostLikes,
            RetrieveBy::MostRecent,
            RetrieveBy::Id("".to_string()),
        ],
        doc! {"_id": comment_id},
    )
    .await
}
