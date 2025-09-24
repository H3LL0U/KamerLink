use axum::{
    extract::{Extension, Query},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use futures::TryStreamExt;
use mongodb::{
    Collection,
    bson::{doc, oid::ObjectId},
    options::FindOptions,
};
use serde::Serialize;
use serde::{Deserialize, de::DeserializeOwned};
use utoipa::ToSchema;

use crate::{AppState, database::schemas::user::User};

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub enum RetrieveBy {
    _Self,
    Id(String),
    UserId(String),
    MostLikes,
    MostPoints,
    MostRecent,
    NewToUser,
}
//
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct RetrievePaginated {
    pub r#type: RetrieveBy,
    pub(crate) page: usize,
}

// Used to build a paginated response from
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
}

pub async fn retrieve_items<T>(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrievePaginated>,
    collection: &str,
) -> Response
where
    T: DeserializeOwned + Unpin + Send + Sync + Serialize,
{
    let collection: Collection<T> = state.db.collection(collection);

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
        RetrieveBy::_Self => {
            let cur_user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
                Ok(k) => k,
                Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            };
            doc! {"_id": cur_user_id}
        }
        RetrieveBy::Id(ref id) => ObjectId::parse_str(id)
            .map(|obj_id| doc! { "_id": obj_id })
            .unwrap_or_else(|_| doc! { "_id": "invalid" }),
        RetrieveBy::UserId(ref uid) => doc! { "user_id": uid },
        RetrieveBy::NewToUser => doc! {},
        _ => doc! {},
    };

    let mut cursor = match collection.find(filter).with_options(find_options).await {
        Ok(c) => c,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let mut items = Vec::new();
    while let Ok(Some(item)) = cursor.try_next().await {
        items.push(item);
    }

    axum::Json(PaginatedResponse { items }).into_response()
}
