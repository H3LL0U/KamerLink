/// This file contains functions and structs that help with building some generic requests
///
///
use crate::{
    AppState,
    database::schemas::user::User,
};

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
    bson::{Bson, Document, doc, oid::ObjectId},
    options::{FindOneAndUpdateOptions, FindOptions, ReturnDocument},
};
use serde::{Deserialize, Deserializer, de::DeserializeOwned};
use serde::Serialize;
use std::{fmt::Debug, str::FromStr};
use utoipa::ToSchema;
use validator::Validate;

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

    // fields for received_likes and received points
    MostReceivedLikes,
    MostReceivedPoints,
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
            "MostReceivedLikes" => Ok(RetrieveBy::MostReceivedLikes),
            "MostReceivedPoints" => Ok(RetrieveBy::MostReceivedPoints),
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

#[derive(Clone, Builder)]
#[builder(setter(strip_option))]
pub struct RetrieveItems<'a> {
    state: Extension<AppState>,
    sub: Extension<Option<String>>,
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
        T: DeserializeOwned + Unpin + Send + Sync + Serialize + Debug,
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
    Extension(sub): Extension<Option<String>>,
    Query(req): Query<RetrievePaginated>,
    collection: &str,
    allowed_retrieval_types: &[RetrieveBy], //Each request has specific retrieval types which it supports which should be specified here.
    base_query: Document,
    projection: Option<Document>,
    size_limit: Option<i64>,
) -> Response
where
    T: DeserializeOwned + Unpin + Send + Sync + Serialize + Debug,
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
            RetrieveBy::MostLikes => doc! { "likes": -1, "_id": -1 },
            RetrieveBy::MostPoints => doc! { "points": -1 ,"_id": -1  },
            RetrieveBy::MostRecent => doc! { "created_at": -1, "_id": -1  },
            RetrieveBy::MostUses => doc! { "base_tag":-1, "uses": -1 , "_id": -1 },
            RetrieveBy::MostReceivedLikes => doc! {"received_likes": -1, "_id": -1 },
            RetrieveBy::MostReceivedPoints => doc! {"received_points" : -1, "_id": -1 },

            _ => doc! {"_id": -1 },
        })
        .projection(projection)
        .build();

    let mut filter = match req.r#type {
        RetrieveBy::_Self => {
            let sub = match sub {
                Some(k) => k,
                None => {
                    return StatusCode::FORBIDDEN.into_response();
                }
            };
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

async fn increment_like<UserObject>(
    user_collection: Collection<UserObject>,
    posts_collection: Collection<Bson>,
    increment_by: i64,
    post_id: ObjectId,
) -> Result<(), StatusCode>
where
    UserObject: Send + Sync,
{
    let post_like_update_filter = doc! {"_id": post_id};

    let updated_post: Document = match posts_collection
        .find_one_and_update(
            post_like_update_filter,
            doc! {"$inc": {"likes": increment_by}},
        )
        .with_options(
            FindOneAndUpdateOptions::builder()
                .return_document(ReturnDocument::After)
                .build(),
        )
        .await
    {
        Ok(Some(bson)) => {
            let doc = match bson {
                Bson::Document(d) => d,
                other => {
                    dbg!(other);
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            };
            doc
        }
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            dbg!(e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    let user_id_string = match updated_post.get("user_id") {
        Some(Bson::String(s)) => s.clone(),
        _ => {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    let user_id = match ObjectId::from_str(user_id_string.as_str()) {
        Ok(k) => k,
        Err(_) => {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let user_like_update_filter = doc! {"_id": user_id};
    if let Err(_) = user_collection
        .update_one(
            user_like_update_filter,
            doc! {"$inc": {"received_likes": increment_by}},
        )
        .await
    {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    Ok(())
}

pub async fn toggle_like_generic(
    sub: &str,
    state: &AppState,
    item_id: &str,
    collection_name: &str,  //posts
    user_likes_field: &str, //likes
) -> Result<bool, StatusCode> {
    let collection = state.db.collection::<Bson>(collection_name);
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
        match increment_like(users_collection, collection, -1, item_obj_id).await {
            Ok(_) => {}
            Err(e) => {
                return Err(e);
            }
        };
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
        match increment_like(users_collection, collection, 1, item_obj_id).await {
            Ok(_) => {}
            Err(e) => {
                return Err(e);
            }
        };
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

pub trait CanEdit {
    fn can_edit(&self, user: &User) -> bool;
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct GenericDeleteItem {
    pub item_id: String,
}

pub async fn delete_item<CollectionItem>(
    Extension(state): Extension<AppState>,
    collection: &str,
    filter: &GenericDeleteItem,
    user: &User,
) -> Result<mongodb::results::DeleteResult, StatusCode>
where
    CollectionItem: CanEdit + DeserializeOwned + Unpin + Send + Sync + Serialize,
{
    let collection = state.db.collection::<CollectionItem>(collection);
    let filter =
        doc! { "_id": ObjectId::from_str(&filter.item_id).map_err(|_| StatusCode::BAD_REQUEST)? };

    let _existing_item = match collection.find_one(filter.clone()).await {
        Ok(k) => {
            k.as_ref()
                .ok_or(StatusCode::BAD_REQUEST)?
                .can_edit(user)
                .then(|| k)
                .ok_or(StatusCode::FORBIDDEN)?;
        }
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    match collection.delete_one(filter).await {
        Ok(result) => Ok(result),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct GenericUpdateItem<T> {
    pub old_item_id: String,
    pub update_draft: T,
}

pub async fn update_item<CollectionItem, ItemDraft>(
    Extension(state): Extension<AppState>,
    collection: &str,
    generic_update_item: &GenericUpdateItem<ItemDraft>,
    user: &User,
) -> Result<mongodb::results::UpdateResult, StatusCode>
where
    ItemDraft: DeserializeOwned + Unpin + Send + Sync + Serialize + Validate,
    CollectionItem: CanEdit + DeserializeOwned + Unpin + Send + Sync + Serialize,
{
    generic_update_item
        .update_draft
        .validate()
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    let collection = state.db.collection::<CollectionItem>(collection);

    let filter = doc! { "_id": ObjectId::from_str(&generic_update_item.old_item_id).map_err(|_| StatusCode::BAD_REQUEST)? };

    // check if the item can be edited by the user

    let _existing_item = match collection.find_one(filter.clone()).await {
        Ok(k) => {
            k.as_ref()
                .ok_or(StatusCode::BAD_REQUEST)?
                .can_edit(user)
                .then(|| k)
                .ok_or(StatusCode::FORBIDDEN)?;
        }
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };
    let update_draft_bson = match mongodb::bson::to_bson(&generic_update_item.update_draft) {
        Ok(bson) => bson,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
    match collection
        .update_one(filter, doc! { "$set": update_draft_bson  })
        .await
    {
        Ok(result) => Ok(result),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
