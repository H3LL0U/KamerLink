use anyhow::Context;
use axum::{
    extract::{Extension, Multipart, Query},
    response::{IntoResponse, Response},
    Json,
};
use futures::TryStreamExt;
use http::StatusCode;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::database::schemas::{post::Location, user};
use crate::AppState;
use chrono::Utc;
use crate::database::schemas::post::Comment;
use crate::database::schemas::user::User;
pub mod like;
use utoipa::{openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme}, OpenApi};
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

use mongodb::{self, bson::{doc, oid::ObjectId}, options::{FindOptions, InsertOneOptions}};
use crate::database::schemas::post::InfraStemPost;



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
        Ok(k) => {k},
        Err(_) => {return  StatusCode::INTERNAL_SERVER_ERROR.into_response()},
    };

    let post_schema = InfraStemPost {
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
        .collection::<InfraStemPost>("posts")
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
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub enum RetrieveBy {
    PostId(String),
    UserId(String),
    MostLikes,
    MostPoints,
    MostRecent,
    NewToUser


}
//
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct RetrievePost {
    r#type: RetrieveBy,
    page: usize
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct Posts{
    posts: Vec<InfraStemPost> // excluding comments
}



#[utoipa::path(
    get,
    path = "/api/post",
    responses(
        (status = 200, description = "Retrieves posts", body = Posts),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
        ("type" = RetrieveBy, Query, description = "Type of retrieval"),
        ("page" = usize, Query, description = "Page number for pagination")
    ),


    description = "Retrieves 5 posts"
)]
pub async fn retreve_posts(
    Extension(state): Extension<AppState>,
    Query(req): Query<RetrievePost>,
) -> Response {
    let collection = state.db.collection::<InfraStemPost>("posts");

    let limit: i64 = 5;
    let skip: i64 = (req.page as i64) * limit;

    let find_options = FindOptions::builder()
        .skip(Some(skip as u64))
        .limit(limit)
        .sort(match req.r#type {
            RetrieveBy::MostLikes => doc! { "likes": -1 },
            RetrieveBy::MostPoints => doc! { "points": -1 },
            RetrieveBy::MostRecent => doc! { "created_at": -1 },
            _ => doc! {},
        })
        .build();

    let filter = match req.r#type {
        RetrieveBy::PostId(ref id) => ObjectId::parse_str(id)
            .map(|obj_id| doc! { "_id": obj_id })
            .unwrap_or_else(|_| doc! { "_id": "invalid" }),
        RetrieveBy::UserId(ref uid) => doc! { "user_id": uid },
        RetrieveBy::NewToUser => doc! {}, // public route, skip `sub`
        _ => doc! {},
    };
    let mut cursor = match collection.find(filter).
    with_options(find_options).await 
    { 
        Ok(c) => c,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(), 
    };
    let mut posts = Vec::new();
    while let Ok(Some(post)) = cursor.try_next().await { posts.push(post); };
    axum::Json(Posts { posts }).into_response()
}
