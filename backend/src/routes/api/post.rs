use anyhow::Context;
use axum::{
    extract::{Extension, Multipart},
    response::{IntoResponse, Response},
    Json,
};
use http::StatusCode;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::AppState;

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostDraft {
    title: String,
    message: String,
    #[schema(value_type = Vec<String>, format = "binary")]
    images: Vec<String>
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostResponse {
    post_id: String,
}

use mongodb;
use crate::database::schemas::InfraStemPost;



#[utoipa::path(
    post,
    path = "api/post",
    request_body(
        content_type = "multipart/formdata", 
        content = PostDraft,
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
            "title" => title = field.text().await.unwrap_or_default(),
            "message" => message = field.text().await.unwrap_or_default(),
            "images" => images.push(field.bytes().await.unwrap().to_vec()),
            _ => {}
        }
    }
    let post_schema = InfraStemPost{
        message: message,
        user_sub: sub,
        title: title,
        img_urls: vec![] //TODO: IMPLEMENT IMAGE SAVING ON ANOTHER SERVICE AND ONLY SAVE THE URLS
    };
    
    let new_id = match state.db.collection::<InfraStemPost>("posts").insert_one(post_schema).await {
        Ok(k) => {k.inserted_id.as_object_id().unwrap_or_default().to_hex()},
        Err(e) => {
            dbg!(e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();},
    };

    let result = PostResponse { post_id: new_id };
    Json(result).into_response()
}
