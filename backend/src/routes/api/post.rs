use std::str::FromStr;

use anyhow::Context;
use axum::{
    Json,
    extract::{Extension, Multipart, Request},
    response::{IntoResponse, Response},
};
use axum_extra::extract::Query;
use futures::TryStreamExt;
use http::{StatusCode, status};

use serde::{Deserialize, Serialize};
use serde_json::from_str;
use substruct::substruct;
use utoipa::{IntoParams, ToSchema};
use validator::Validate;

use crate::{
    AppState,
    database::schemas::{post::EditPostDraft, user::Role},
    routes::request_builder::{self, GenericDeleteItem, GenericUpdateItem, update_item},
};
use crate::{database::schemas::post::Comment, routes::request_builder::retrieve_items};
use crate::{
    database::schemas::{
        post::{KamerlinkPostBuilder, PostTag, RequestPostTag},
        user::User,
    },
    routes::post::tags::update_tags,
};
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
pub mod tags;
///
///
/// Post request (creating a post)
///
///

#[derive(Serialize, Deserialize, Clone, ToSchema, Validate)]

pub struct PostDraft {
    #[validate(length(min = 0, max = 100))]
    title: String,
    #[validate(length(min = 0, max = 5000))]
    message: String,
    #[validate(length(min = 0, max = 10))]
    #[schema(content_media_type = "application/octet-stream")]
    images: Vec<Vec<u8>>,
    #[validate(length(min = 0, max = 50))]
    #[serde(skip_serializing_if = "Option::is_none")]
    tags: Option<Vec<RequestPostTag>>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PostResponse {
    post_id: String,
}

use crate::database::schemas::post::KamerlinkPost;
use mongodb::{
    self, Database,
    bson::{self, Document, doc, oid::ObjectId},
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
    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::UNAUTHORIZED.into_response(),
    };
    let mut title = String::new();
    let mut message = String::new();
    let mut images: Vec<Vec<u8>> = vec![];
    let mut tags: Vec<RequestPostTag> = vec![];
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
            "tags" => {
                let text = field.text().await.unwrap_or_default();
                if let Ok(parsed_tags) = from_str::<Vec<RequestPostTag>>(&text) {
                    tags = parsed_tags;
                } else {
                    eprintln!("Failed to parse tags: {}", text);
                    return StatusCode::BAD_REQUEST.into_response();
                }
            }
            _ => {}
        }
    }

    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let tags = match update_tags(tags, state.db.clone(), None, Some(user_id.to_hex())).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    let tag_ids: Vec<ObjectId> = tags.iter().map(|tag| tag._id).collect();
    let post_schema = match KamerlinkPostBuilder::default()
        ._id(ObjectId::new())
        .user_id(user_id.to_string())
        .created_at(Utc::now().to_rfc3339())
        .title(title)
        .message(message)
        .img_urls(vec![]) // TODO: replace with uploaded URLs
        .likes(0)
        .points(0)
        .tags(Some(tag_ids))
        .comment_count(Some(0))
        .build()
    {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    // validate the schema before inserting:
    if let Err(_) = post_schema.validate() {
        return StatusCode::BAD_REQUEST.into_response();
    }

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
/// Get request (Getting a specific or multiple posts)
///
///
#[derive(Serialize, Deserialize, Clone, ToSchema, IntoParams)]
#[into_params(style = Form, parameter_in = Query)]
pub struct Search {
    #[param(required = false)]
    pub search: Option<String>,
}

#[utoipa::path(
    get,
    path = "/api/post",
    responses(
        (status = 200, description = "Retrieves posts", body = PaginatedResponse<KamerlinkPost>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
        RetrievePaginated,
        Search
    ),


    description = "Retrieves 5 posts"
)]
pub async fn retrieve_posts(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<Option<String>>,
    Query(req): Query<RetrievePaginated>,
    Query(search): Query<Search>,
) -> Response {
    let base_query = match search.search {
        Some(search_string) => {
            //parse tag_ids string into their respective ObjectIds
            let mut tag_ids = Vec::new();

            for tag_str in search_string.split(' ') {
                match ObjectId::from_str(tag_str) {
                    Ok(oid) => tag_ids.push(oid),
                    Err(_) => return StatusCode::BAD_REQUEST.into_response(),
                }
            }
            doc! {
                "tags": { "$all": tag_ids }



            }
        }
        None => {
            doc! {}
        }
    };

    crate::routes::request_builder::RetrieveItemsBuilder::default()
        .state(Extension(state))
        .sub(Extension(sub))
        .req(Query(req))
        .collection("posts")
        .allowed_retrieval_types(&[
            RetrieveBy::Id("".to_string()),
            RetrieveBy::MostPoints,
            RetrieveBy::MostLikes,
            RetrieveBy::MostPoints,
            RetrieveBy::MostRecent,
        ])
        .base_query(base_query)
        .build()
        .unwrap()
        .run::<KamerlinkPost>()
        .await
}

#[utoipa::path(
    patch,
    path = "/api/post",
    responses(
        (status = 200, description = "Updates the post" ), // The id of the new post gets returned
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = GenericUpdateItem<PostDraft>,

    description = "Updates a post if authorized"
)]
pub async fn update_post(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Json(input): Json<GenericUpdateItem<PostDraft>>,
) -> Response {
    let cur_user: User = match User::get_user_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    };

    let collection = state.db.collection::<KamerlinkPost>("posts");

    let post_id = match ObjectId::from_str(input.old_item_id.as_str()) {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::BAD_REQUEST.into_response();
        }
    };

    let cur_post = match collection
        .find_one({
            doc! {"_id": post_id}
        })
        .await
    {
        Ok(k) => match k {
            Some(k) => k,
            None => {
                return StatusCode::NOT_FOUND.into_response();
            }
        },
        Err(_) => {
            return StatusCode::BAD_REQUEST.into_response();
        }
    };
    let previous_tags = cur_post.tags;

    let updated_tags = match update_tags(
        input.update_draft.tags.unwrap_or(Vec::new()),
        state.db.clone(),
        previous_tags,
        Some(cur_user._id.to_hex()),
    )
    .await
    {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    let tag_ids: Vec<ObjectId> = updated_tags.iter().map(|tag| tag._id).collect();

    let edit_post_draft = EditPostDraft {
        title: input.update_draft.title,
        message: input.update_draft.message,
        tags: Some(tag_ids),
    };

    match update_item::<KamerlinkPost, EditPostDraft>(
        Extension(state),
        "posts",
        &GenericUpdateItem {
            old_item_id: input.old_item_id,
            update_draft: edit_post_draft,
        },
        &cur_user,
    )
    .await
    {
        Ok(k) => return StatusCode::OK.into_response(),
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    }
}

#[utoipa::path(
    delete,
    path = "/api/post",
    responses(
        (status = 200, description = "Post deleted" ), // The id of the new post gets returned
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = GenericDeleteItem,

    description = "Deletes post if authorized"
)]
pub async fn delete_post(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Json(input): Json<request_builder::GenericDeleteItem>,
) -> Response {
    let cur_user: User = match User::get_user_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    };

    match request_builder::delete_item::<KamerlinkPost>(
        Extension(state),
        "posts",
        &input,
        &cur_user,
    )
    .await
    {
        Ok(_) => {
            return StatusCode::OK.into_response();
        }
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    }
}
