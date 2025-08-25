use std::str::FromStr;
use axum::{
    response::{IntoResponse, Response},
    Extension, Json,
};
use http::StatusCode;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use mongodb::bson::{doc, oid::ObjectId};
use crate::{database::schemas::{post::InfraStemPost, user::User}, routes::post::Posts, AppState};

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
    path = "api/gamble",
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
    let collection = state.db.collection::<User>("users");
    let posts_collection = state.db.collection::<InfraStemPost>("posts");
    let cur_user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let post_id = match ObjectId::from_str( &input.post_id) {
                Ok(k) => {k},
                Err(_) => {return StatusCode::INTERNAL_SERVER_ERROR.into_response()},
            };
    // Check if post_id is already in user's likes
    let filter = doc! {
        "_id": &cur_user_id,
        "likes": { "$in": [ &input.post_id ] }
    };

    match collection.find_one(filter).await {
        Ok(Some(_)) => {
            // Post is already liked → UNLIKE


            //remove post from user
            let update = doc! {
                "$pull": { "likes": &input.post_id }
            };
            if let Err(_) = collection.update_one(doc! {"_id": &cur_user_id}, update).await {
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }

            //subtract likes from post

            let filter = doc! {
                "_id": post_id
            };

            if let Err(_) =  posts_collection.update_one(filter, doc! {"$inc": {"likes":-1} }).await{
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
            
            Json(ResponseLikePost {
                status: LikeStatus::Unlike,
            })
            .into_response()
        }
        Ok(None) => {
            // Post is not liked → LIKE
            
            
            // Add post to user's likes
            let update = doc! {
                "$push": { "likes": &input.post_id }
            };
            if let Err(_) = collection.update_one(doc! {"_id": &cur_user_id}, update).await {
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }

            // Increment the like counter under a post
            let filter = doc! {
                "_id": post_id
            };

            if let Err(_) =  posts_collection.update_one(filter, doc! {"$inc": {"likes": 1} }).await{
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
            

            Json(ResponseLikePost {
                status: LikeStatus::Like,
            })
            .into_response()
        }
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}
