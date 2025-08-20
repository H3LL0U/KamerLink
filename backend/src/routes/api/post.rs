use anyhow::Context;
use axum::{
    extract::{Extension, Multipart},
    response::{IntoResponse, Response},
    Json,
};
use http::StatusCode;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use crate::database::schemas::post::Location;
use crate::AppState;
use chrono::Utc;
use crate::database::schemas::post::Comment;
///
/// 
/// Post request (creating a post)
/// 
/// 

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostDraft {
    title: String,
    message: String,
    #[schema(value_type = Vec<String>, format = "binary")]
    images: Vec<String>,
    location: Option<Location>,
    goal: Option<usize>
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostResponse {
    post_id: String,
}

use mongodb;
use crate::database::schemas::post::InfraStemPost;



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
    let mut location: Option<Location> = None;
    let mut goal: Option<usize> = None;
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
            "location" => {
                if let Ok(text) = field.text().await {
                    // Expecting: {"type":"Point","coordinates":[lon,lat]}
                    match serde_json::from_str::<Location>(&text) {
                        Ok(loc) => location = Some(loc),
                        Err(e) => {
                            dbg!(e);
                            return StatusCode::BAD_REQUEST.into_response();
                        }
                    }
                }
            }
            "goal" => {
                if let Ok(text) = field.text().await {
                    match text.trim().parse::<usize>() {
                        Ok(val) => goal = Some(val),
                        Err(_) => {
                            // Invalid number sent
                            return StatusCode::BAD_REQUEST.into_response();
                        }
                    }
                }
            }
            _ => {}
        }
    }

    

    let post_schema = InfraStemPost {

        user_sub: sub,
        created_at: Utc::now().to_rfc3339(), 
        title,
        message,
        img_urls: vec![], // TODO: replace with URLs after upload
        likes: 0,
        points: 0,
        goal,
        comments: Vec::new(),
        location: location,
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
enum RetriveBy {
    Id(String),
    ClosestBy(Location)



}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct RetrievePost {
    r#type: RetriveBy

}

#[utoipa::path(
    get,
    path = "api/post",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Retrieves posts", body = RetrievePost),
        (status = 401, description = "Unauthorized - missing or invalid token")
    )
)]
pub async fn retrieve_post( Json(input): Json<RetrievePost>, ) -> Response {


    return StatusCode::NOT_IMPLEMENTED.into_response();
}