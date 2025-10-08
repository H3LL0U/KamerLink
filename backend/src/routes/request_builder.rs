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
use std::str::FromStr;
use utoipa::ToSchema;

#[derive(Serialize, Debug, Clone, ToSchema)]
#[serde(untagged)]
#[schema(
    description = "RetrieveBy can be either one of the fixed options (`\"_Self\"`, `\"MostLikes\"`, `\"MostPoints\"`, `\"MostRecent\"`) or any string (interpreted as an ID)."
)]
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

    /// Retrieves the items that have "uses" set to the highest value. the values that have "base_tag" set to true and then uses in descending order
    MostUses,
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
            "MostUses" => Ok(RetrieveBy::MostUses),
            other => Ok(RetrieveBy::Id(other.to_string())),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, utoipa::IntoParams)]
#[into_params(style = Form, parameter_in = Query)]
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
pub struct RetrieveItems<'a> {
    state: Extension<AppState>,
    sub: Extension<String>,
    req: Query<RetrievePaginated>,
    collection: &'a str,

    /// extra query that gets applied to some fields
    #[builder(default)]
    base_query: Document,
    #[builder(default)]
    allowed_retrieval_types: &'a [RetrieveBy],
    #[builder(default)]
    projection: Option<Document>,
    #[builder(default)]
    size_limit: Option<i64>,
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
            self.projection.clone(),
            self.size_limit,
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
    projection: Option<Document>,
    size_limit: Option<i64>,
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

    let limit: i64 = size_limit.unwrap_or(5);
    let skip: i64 = (req.page as i64) * limit;

    let find_options = FindOptions::builder()
        .skip(Some(skip as u64))
        .limit(limit)
        .sort(match req.r#type {
            RetrieveBy::MostLikes => doc! { "likes": -1 },
            RetrieveBy::MostPoints => doc! { "points": -1 },
            RetrieveBy::MostRecent => doc! { "created_at": -1 },
            RetrieveBy::MostUses => doc! { "base_tag":-1, "uses": -1 },

            _ => doc! {},
        })
        .projection(projection)
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

// Generic like

/// Generic like toggling function for any collection and object id
///
///

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub enum LikeStatus {
    Like,
    Unlike,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct ResponseGenericLike {
    pub status: LikeStatus,
}

//generic request body for like/unlike
#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct GenericLike {
    pub _id: String,
}

pub async fn toggle_like_generic(
    sub: &str,
    state: &AppState,
    item_id: &str,
    collection_name: &str,

    user_likes_field: &str,
) -> Result<bool, StatusCode> {
    let collection = state
        .db
        .collection::<mongodb::bson::Document>(collection_name);
    let users_collection = state.db.collection::<User>("users");
    let cur_user_id = match User::get_user_id_by_sub(&state.db, sub).await {
        Ok(k) => k,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    // Check if item_id is already in user's likes
    let filter = doc! {
        "_id": &cur_user_id,
        user_likes_field: { "$in": [item_id] }
    };

    let already_liked = match users_collection.find_one(filter).await {
        Ok(Some(_)) => true,
        Ok(None) => false,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    let item_obj_id = match ObjectId::from_str(item_id) {
        Ok(k) => k,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    if already_liked {
        // Unlike: remove from user, decrement like counter
        let update = doc! { "$pull": { user_likes_field: item_id } };
        if let Err(_) = users_collection
            .update_one(doc! {"_id": &cur_user_id}, update)
            .await
        {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        let filter = doc! {"_id": item_obj_id};
        if let Err(_) = collection
            .update_one(filter, doc! {"$inc": {"likes": -1}})
            .await
        {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        Ok(false) // Now unliked
    } else {
        // Like: add to user, increment like counter
        let update = doc! { "$push": { user_likes_field: item_id } };
        if let Err(_) = users_collection
            .update_one(doc! {"_id": &cur_user_id}, update)
            .await
        {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        let filter = doc! {"_id": item_obj_id};
        if let Err(_) = collection
            .update_one(filter, doc! {"$inc": {"likes": 1}})
            .await
        {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        Ok(true) // Now liked
    }
}

// --- Generic Add Item Builder and Function ---
#[derive(Clone, Builder)]
#[builder(setter(strip_option))]
pub struct AddItem<'a> {
    pub state: Extension<AppState>,
    pub collection: &'a str,
    pub document: Document,
}

impl<'a> AddItem<'a> {
    pub async fn run(&self) -> Result<mongodb::results::InsertOneResult, StatusCode> {
        add_item(self.state.clone(), self.collection, self.document.clone()).await
    }
}

pub async fn add_item(
    Extension(state): Extension<AppState>,
    collection: &str,
    document: Document,
) -> Result<mongodb::results::InsertOneResult, StatusCode> {
    let collection = state.db.collection::<Document>(collection);
    match collection.insert_one(document).await {
        Ok(result) => Ok(result),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
