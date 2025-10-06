use crate::database::schemas::post::{
    Comment, CommentBuilder, CommentDraft, ReplyBuilder, RequestPostTag,
};
use crate::database::schemas::post::{PostTag, Reply};
use crate::database::schemas::user;
use crate::routes::request_builder::{
    GenericLike, LikeStatus, ResponseGenericLike, RetrieveItemsBuilder, toggle_like_generic,
};
use crate::routes::request_builder::{
    PaginatedResponse, RetrieveBy, RetrievePaginated, retrieve_items,
};
use crate::{
    AppState,
    database::schemas::{post::KamerlinkPost, user::User},
};
use axum::extract::{Path, Request};
use axum::{
    Extension, Json,
    response::{IntoResponse, Response},
};
use mongodb::error::Error;

use axum_extra::extract::Query;
use chrono::Utc;
use http::StatusCode;
use mongodb::Database;
use mongodb::bson::Document;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::results::InsertOneResult;
use serde;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::Arc;
use utoipa::{IntoParams, ToSchema};
use validator::Validate;

const MAX_TAGS_PER_POST: usize = 20;

#[utoipa::path(
    post,
    path = "/api/post/tags",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "retrieves suggested", body = PaginatedResponse<PostTag>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params (RetrievePaginated)
)]
pub async fn retrieve_tags(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<RetrievePaginated>,
) -> Response {
    RetrieveItemsBuilder::default()
        .state(axum::Extension(state))
        .collection("post_tags")
        .allowed_retrieval_types(&[RetrieveBy::MostUses])
        .base_query(doc! {})
        .size_limit(20) //20 tags at a time
        .build()
        .unwrap()
        .run::<PostTag>()
        .await
}

///This function is not an api endpoint

pub async fn update_tags(
    tags: Vec<RequestPostTag>,
    db: Arc<Database>,
) -> Result<Vec<PostTag>, Error> {
    let collection = db.collection::<PostTag>("post_tags");
    let mut actual_tags: Vec<PostTag> = Vec::new();

    // Validate each tag before inserting
    for tag in &tags {
        match tag.validate() {
            Ok(k) => {}
            Err(e) => {
                return Err(Error::from(mongodb::error::ErrorKind::Custom(Arc::new(e))));
            }
        }
    }

    for tag in tags {
        let filter = doc! { "tag_name": &tag.tag_name.to_lowercase() };
        let update = doc! {
            "$setOnInsert": {
                "_id": ObjectId::new(),
                "tag_name": &tag.tag_name,
                "color": &tag.color,
                "base_tag": false,
                "uses": 0
            },
            "$inc": { "uses": 1 }
        };

        // Return the document *after* update
        let options = FindOneAndUpdateOptions::builder()
            .upsert(true)
            .return_document(ReturnDocument::After)
            .build();

        if let Some(updated_doc) = collection
            .find_one_and_update(filter, update)
            .with_options(options)
            .await?
        {
            actual_tags.push(updated_doc);
        }
    }

    Ok(actual_tags)
}
