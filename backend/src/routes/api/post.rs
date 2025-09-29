use anyhow::Context;
use axum::{
    Json,
    extract::{Extension, Multipart},
    response::{IntoResponse, Response},
};
use axum_extra::extract::Query;
use futures::TryStreamExt;
use http::StatusCode;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::database::schemas::user::User;
use crate::{AppState, routes::request_builder};
use crate::{database::schemas::post::Comment, routes::request_builder::retrieve_items};
use chrono::Utc;
use request_builder::PaginatedResponse;
use request_builder::{RetrieveBy, RetrievePaginated};
use utoipa::{
    OpenApi,
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
};
pub mod comment;
pub mod like;
pub mod points;
///
///
/// Post request (creating a post)
///
///

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostDraft {
    title: String,
    message: String,
    #[schema(content_media_type = "application/octet-stream")]
    images: Vec<Vec<u8>>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostResponse {
    post_id: String,
}

use crate::database::schemas::post::KamerlinkPost;
use mongodb::{
    self,
    bson::{doc, oid::ObjectId},
    options::{FindOptions, InsertOneOptions},
};

#[utoipa::path(
    post,
    path = "/api/post",
    request_body(
        content_type = "multipart/form-data",
        content = inline(PostDraft),
        description = "Creates a post"
    ),
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "creates post", body = PostResponse),
        (status = 401, description = "Unauthorized - missing or invalid token")
    )
)]
#[axum::debug_handler]
pub async fn create_post(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    mut multipart: Multipart,
) -> Response {
    let mut title = String::new();
    let mut message = String::new();
    let mut images: Vec<Vec<u8>> = vec![];
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or_default();
        match name {
            "title" => {
                title = field.text().await.unwrap_or_default();
            }
            "message" => {
                message = field.text().await.unwrap_or_default();
            }
            "images" => {
                images.push(field.bytes().await.unwrap().to_vec());
            }

            _ => {}
        }
    }

    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let post_schema = KamerlinkPost {
        _id: ObjectId::new(),
        user_id: user_id.to_string(),
        created_at: Utc::now().to_rfc3339(),
        title,
        message,
        img_urls: vec![], // TODO: replace with URLs after upload
        likes: 0,
        points: 0,
    };

    let new_id = match state
        .db
        .collection::<KamerlinkPost>("posts")
        .insert_one(post_schema)
        .await
    {
        Ok(k) => k
            .inserted_id
            .as_object_id()
            .map(|id| id.to_hex())
            .unwrap_or_default(),
        Err(e) => {
            dbg!(e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let result = PostResponse { post_id: new_id };
    Json(result).into_response()
}

///
///
/// Get request (Getting a specific or multipple posts)
///
///

#[utoipa::path(
    get,
    path = "/api/post",
    responses(
        (status = 200, description = "Retrieves posts", body = PaginatedResponse<KamerlinkPost>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
        RetrievePaginated
    ),


    description = "Retrieves 5 posts"
)]
pub async fn retrieve_posts(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrievePaginated>,
) -> Response {
    retrieve_items::<KamerlinkPost>(
        Extension(state),
        Extension(sub),
        Query(req),
        "posts",
        &[
            RetrieveBy::Id("".to_string()),
            RetrieveBy::MostPoints,
            RetrieveBy::MostLikes,
            RetrieveBy::MostPoints,
            RetrieveBy::MostRecent,
        ],
        doc! {},
    )
    .await
}
