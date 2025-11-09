use crate::database::schemas::post::{Comment, CommentBuilder, CommentDraft, ReplyBuilder};
use crate::database::schemas::post::{CommentEditDraft, Reply};
use crate::database::schemas::user;
use crate::routes::request_builder::{
    self, GenericLike, GenericUpdateItem, LikeStatus, ResponseGenericLike, RetrieveItemsBuilder,
    delete_item, toggle_like_generic, update_item,
};
use crate::routes::request_builder::{
    PaginatedResponse, RetrieveBy, RetrievePaginated, retrieve_items,
};
use crate::{
    AppState,
    database::schemas::{post::KamerlinkPost, user::User},
};
use axum::extract::Path;
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
use serde;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::{IntoParams, ToSchema};
use validator::Validate;
#[utoipa::path(
    post,
    path = "/api/post/comment",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Adds a comment to a post (returns a comment id)", body = Comment),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = CommentDraft
)]
pub async fn create_comment(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<CommentDraft>,
) -> Response {
    let post_id = match ObjectId::from_str(&input.post_id.as_str()) {
        Ok(k) => k,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };

    let collection = state.db.collection::<Comment>("comments");
    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    //validate comment before inserting
    match &input.validate() {
        Ok(_) => {}
        Err(_) => {
            return StatusCode::BAD_REQUEST.into_response();
        }
    }

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

    let comment_id = match collection.insert_one(&comment).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    let id = match comment_id.inserted_id.as_object_id() {
        Some(k) => k,
        None => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    // increment comment count for posts

    let posts_collection = state.db.collection::<KamerlinkPost>("posts");

    let _ = match posts_collection
        .update_one(doc! {"_id":post_id}, doc! {"$inc": { "comment_count": 1}})
        .await
    {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    return Json(&comment).into_response();
}

#[derive(Deserialize, Serialize, IntoParams, ToSchema)]

pub struct RetrieveComment {
    pub r#type: RetrieveBy,
    pub(crate) page: usize,

    pub post_id: String,
}

impl RetrieveComment {
    pub fn into_retrieve_paginated(&self) -> RetrievePaginated {
        RetrievePaginated {
            r#type: self.r#type.clone(),
            page: self.page,
        }
    }
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
    let post_id = match ObjectId::from_str(&req.post_id) {
        Ok(k) => k,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };
    crate::routes::request_builder::RetrieveItemsBuilder::default()
        .state(Extension(state))
        .sub(Extension(sub))
        .req(Query(req.into_retrieve_paginated()))
        .collection("comments")
        .allowed_retrieval_types(&[
            RetrieveBy::MostLikes,
            RetrieveBy::MostRecent,
            RetrieveBy::Id("".to_string()),
        ])
        .base_query(doc! {"post_id": post_id.to_hex()})
        .build()
        .unwrap()
        .run::<Comment>()
        .await
}

#[utoipa::path(
    post,
    path = "/api/post/comment/like",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Toggles the like/unlike under a comment", body = ResponseGenericLike),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = GenericLike
)]
pub async fn like_comment(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<GenericLike>,
) -> Response {
    let result = toggle_like_generic(
        sub.as_str(),
        &state,
        &input._id,
        "comments",
        "comment_likes", // or "likes" if your user schema uses the same field for comments
    )
    .await;

    match result {
        Ok(true) => {
            // Now liked
            Json(ResponseGenericLike {
                status: LikeStatus::Like,
            })
            .into_response()
        }
        Ok(false) => {
            // Now unliked
            Json(ResponseGenericLike {
                status: LikeStatus::Unlike,
            })
            .into_response()
        }
        Err(_) => http::StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

#[derive(Deserialize, Serialize, IntoParams, ToSchema, Debug, Clone)]
pub struct ReplyDraft {
    pub comment_id: String,
    pub message: String,
}

#[utoipa::path(
    post,
    path = "/api/post/comment/reply",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Adds a reply to a comment (returns the updated comment)", body = Reply),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = ReplyDraft
)]
pub async fn add_reply_to_comment(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<ReplyDraft>,
) -> Response {
    let collection = state.db.collection::<Comment>("comments");
    let user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let reply = match ReplyBuilder::default()
        .created_at(Utc::now().to_rfc3339())
        .user_id(user_id.to_hex())
        .likes(0)
        .message(input.message.clone())
        .build()
    {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let comment_obj_id = match ObjectId::from_str(&input.comment_id) {
        Ok(k) => k,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };

    let reply_bson = match mongodb::bson::to_bson(&reply) {
        Ok(bson) => bson,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let update_result = collection
        .update_one(
            doc! {"_id": comment_obj_id},
            doc! {"$push": {"replies": reply_bson} },
        )
        .await;

    match update_result {
        Ok(res) if res.modified_count == 1 => {
            // return the inserted reply
            return Json(&reply).into_response();
        }

        _ => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

#[utoipa::path(
    patch,
    path = "/api/post/comment",
    responses(
        (status = 200, description = "Updates the comment" ), 
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = GenericUpdateItem<CommentEditDraft>,

    description = "Updates a comment if authorized"
)]

pub async fn update_comment(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Json(input): Json<GenericUpdateItem<CommentEditDraft>>,
) -> Response {
    let user: User = match User::get_user_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    };

    return match update_item::<Comment, CommentEditDraft>(
        Extension(state),
        "comments",
        &input,
        &user,
    )
    .await
    {
        Ok(_) => StatusCode::OK.into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
}

#[utoipa::path(
    delete,
    path = "/api/post/comment",
    responses(
        (status = 200, description = "Deletes a comment" ), // The id of the new post gets returned
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = request_builder::GenericDeleteItem,

    description = "Deletes post if authorized"
)]
pub async fn delete_comment(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Json(input): Json<request_builder::GenericDeleteItem>,
) -> Response {
    let user = match User::get_user_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::FORBIDDEN.into_response();
        }
    };

    let comments_collection = state.db.collection::<Comment>("comments");

    let post_id = match comments_collection
        .find_one(doc! {"_id": match ObjectId::from_str(&input.item_id) {
            Ok(k) => k,
            Err(_) => return StatusCode::BAD_REQUEST.into_response(),
        }})
        .await
    {
        Ok(k) => match k {
            Some(k) => match ObjectId::from_str(&k.post_id) {
                Ok(k) => k,
                Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            },
            None => return StatusCode::NOT_FOUND.into_response(),
        },
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    match delete_item::<Comment>(Extension(state.clone()), "comments", &input, &user).await {
        Ok(_) => {}
        Err(e) => {
            return e.into_response();
        }
    };

    let posts_collection = state.db.collection::<KamerlinkPost>("posts");

    match posts_collection
        .update_one(
            doc! {"_id": post_id},
            doc! {"$inc": { "comment_count" : -1}},
        )
        .await
    {
        Ok(_) => {
            return StatusCode::OK.into_response();
        }
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
}

//In case there is a need to not retrieve all comments at once. for now replies will be fetched with the comment

// #[utoipa::path(
//     get,
//     path = "/api/post/comment/{comment_id}/replies",
//     responses(
//         (status = 200, description = "Retrieves replies for a comment", body = PaginatedResponse<Comment>),
//         (status = 401, description = "Unauthorized - missing or invalid token")
//     ),
//     params(
//         ("comment_id" = String, Path, description = "The id of the comment to get replies for"),
//         RetrievePaginated
//     ),

//     description = "Retrieves replies for a comment"
// )]
// pub async fn retrieve_comment_replies(
//     Extension(state): Extension<AppState>,
//     Extension(sub): Extension<String>,
//     Path(comment_id): Path<String>,
//     Query(req): Query<RetrievePaginated>,
// ) -> Response {
//     let comment_obj_id = match ObjectId::from_str(&comment_id) {
//         Ok(k) => k,
//         Err(_) => return StatusCode::BAD_REQUEST.into_response(),
//     };

//     RetrieveItemsBuilder::default()
//         .state(Extension(state))
//         .sub(Extension(sub))
//         .req(Query(req))
//         .collection("comments")
//         .allowed_retrieval_types(&[
//             RetrieveBy::Id(comment_id.clone()),
//             RetrieveBy::MostLikes,
//             RetrieveBy::MostRecent,
//         ])
//         .base_query(doc! {"_id": comment_obj_id})
//         .projection(doc! {"replies": 1, "_id": 0})
//         .build()
//         .unwrap()
//         .run::<Comment>()
//         .await
// }
