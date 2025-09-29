/// This file contains functions and structs that help with building some generic requests
///
///
use crate::{AppState, database::schemas::user::User};
use axum::{
    extract::Extension,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use axum_extra::extract::Query;
use derive_builder::Builder;
use futures::TryStreamExt;
use mongodb::{
    Collection,
    bson::{Document, doc, oid::ObjectId},
    options::FindOptions,
};
use serde::{Deserialize, Deserializer, de::DeserializeOwned};
use serde::{Serialize, Serializer};
use utoipa::ToSchema;

#[derive(Debug, Clone, ToSchema)]
/// Defines the different ways items can be retrieved.
///
/// Each variant represents a retrieval strategy that can be used in queries.
///
pub enum RetrieveBy {
    /// Retrieves items that have the same `_id` as the user
    /// who is currently accessing the page.
    /// (Mostly used for the `User` type.)
    _Self,

    /// Retrieves items with the given MongoDB ObjectId.
    Id(String),

    /// Retrieves all items, sorted by the number of likes (descending).
    MostLikes,

    /// Retrieves all items, sorted by the number of points (descending).
    MostPoints,

    /// Retrieves all items, sorted by creation date (`created_at` field, descending).
    MostRecent,
}

impl Serialize for RetrieveBy {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = match self {
            RetrieveBy::_Self => "_Self",
            RetrieveBy::Id(id) => id,
            RetrieveBy::MostLikes => "MostLikes",
            RetrieveBy::MostPoints => "MostPoints",
            RetrieveBy::MostRecent => "MostRecent",
        };
        serializer.serialize_str(s)
    }
}

impl<'de> Deserialize<'de> for RetrieveBy {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;

        match s.as_str() {
            "_Self" => Ok(RetrieveBy::_Self),
            "MostLikes" => Ok(RetrieveBy::MostLikes),
            "MostPoints" => Ok(RetrieveBy::MostPoints),
            "MostRecent" => Ok(RetrieveBy::MostRecent),
            other => Ok(RetrieveBy::Id(other.to_string())),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, utoipa::IntoParams)]

pub struct RetrievePaginated {
    pub r#type: RetrieveBy,
    pub(crate) page: usize,
}

// Used to build a paginated response from
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
}

fn validate_retrieve_by(req: &RetrieveBy, allowed: &[RetrieveBy]) -> Result<(), StatusCode> {
    if allowed
        .iter()
        .any(|allowed| std::mem::discriminant(allowed) == std::mem::discriminant(req))
    {
        Ok(())
    } else {
        Err(StatusCode::BAD_REQUEST)
    }
}

///Can be used to build the retrieve items function
#[builder(setter(strip_option))]
#[derive(Clone, Builder)]
struct RetrieveItems<'a> {
    state: Extension<AppState>,
    sub: Extension<String>,
    req: Query<RetrievePaginated>,
    collection: &'a str,

    /// extra query that gets applied to some fields
    #[builder(default)]
    base_query: Document,
    #[builder(default)]
    allowed_retrieval_types: &'a [RetrieveBy],
}

impl<'a> RetrieveItems<'_> {
    pub async fn run<T>(&self) -> Response
    where
        T: DeserializeOwned + Unpin + Send + Sync + Serialize,
    {
        retrieve_items::<T>(
            self.state.clone(),
            self.sub.clone(),
            self.req.clone(),
            self.collection,
            self.allowed_retrieval_types,
            self.base_query.clone(),
        )
        .await
    }
}

/// Used to build a paginated responses
/// (gets items in the groups of 5 based on the provided parameters)
/// it returns a response where the body is PaginatedResponse<T>
pub async fn retrieve_items<T>(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrievePaginated>,
    collection: &str,
    allowed_retrieval_types: &[RetrieveBy], //Each request has specific retrieval types which it supports which should be specified here.
    base_query: Document,
) -> Response
where
    T: DeserializeOwned + Unpin + Send + Sync + Serialize,
{
    //check if the retrieval type is allowed

    match validate_retrieve_by(&req.r#type, allowed_retrieval_types) {
        Ok(_) => {}
        Err(e) => return e.into_response(),
    };

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

    let mut filter = match req.r#type {
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
        _ => doc! {},
    };
    filter.extend(base_query);
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
