use crate::database::schemas::post::PostTag;
use crate::database::schemas::post::RequestPostTag;
use crate::routes::request_builder::RetrieveItemsBuilder;

use crate::AppState;
use crate::routes::request_builder::{PaginatedResponse, RetrieveBy, RetrievePaginated};
use axum::extract::Path;
use axum::{
    Extension, Json,
    response::{IntoResponse, Response},
};
use futures::TryStreamExt;
use mongodb::error::Error;
use regex::escape;

use crate::routes::api::post::Search;
use axum_extra::extract::Query;
use http::StatusCode;
use mongodb::bson::{Bson, Document, Regex};
use mongodb::bson::{doc, oid::ObjectId};
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::{Collection, Database};
use std::str::FromStr;
use std::sync::Arc;
use validator::Validate;

pub const MAX_TAGS_PER_POST: i64 = 50;

#[utoipa::path(
    get,
    path = "/api/post/tags/{post_id}",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "retrieves suggested tags", body = PaginatedResponse<PostTag>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params (
        ("post_id" = Option<String>,  Path, description = "The id of the post to get replies for"),
        Search,
        RetrievePaginated),

    description = "Retrieves the most used tags with tags that have base_tag set true being first. Changes behavior if post_id is supplied. In that case will return the tags of that specific post"
)]
pub async fn retrieve_tags(
    Extension(sub): Extension<Option<String>>,
    Extension(state): Extension<AppState>,
    post_id: Option<Path<String>>,
    Query(input): Query<RetrievePaginated>,
    Query(search): Query<Search>,
) -> Response {
    let base_query = match search.search {
        Some(ref search_str) if !search_str.is_empty() => {
            // Case-insensitive regex match on tag_name
            doc! {
                "tag_name": {
                    "$regex": Regex {
                        pattern: escape(search_str),
                        options: "i".to_string(), // case-insensitive
                    }
                }
            }
        }
        _ => doc! {}, // no filter if no search term
    };
    let _ = match post_id {
        Some(Path(post_id)) => {
            // extract all tags
            let post_id = match ObjectId::from_str(&post_id) {
                Ok(k) => k,
                Err(_) => return StatusCode::BAD_REQUEST.into_response(),
            };

            let posts_collection = state.db.collection::<Document>("posts");

            //find the post which contains the tags
            let tags_doc = match posts_collection
                .find_one(doc! {"_id" : post_id})
                .projection(doc! {"tags":1, "_id":1})
                .await
            {
                Ok(k) => match k {
                    Some(k) => k,
                    None => {
                        return Json(PaginatedResponse {
                            items: Vec::<PostTag>::new(),
                        })
                        .into_response();
                    }
                },
                Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            };

            //retrieve the tag ids from the field
            let tag_ids: Vec<ObjectId> = match tags_doc.get_array("tags") {
                Ok(arr) => arr
                    .iter()
                    .filter_map(|b| match b {
                        Bson::ObjectId(oid) => Some(oid.clone()),
                        _ => None,
                    })
                    .collect(),
                Err(e) => {
                    dbg!(e);
                    Vec::new()
                }
            };
            //fetch the tags from the database
            let tags = match retrieve_tags_in_bulk(tag_ids, state.db, Some(base_query)).await {
                Ok(k) => k,
                Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            };

            return Json(PaginatedResponse { items: tags }).into_response();
        }
        None => {
            // if there is no post_id provided return the strings
            let response = RetrieveItemsBuilder::default()
                .state(axum::Extension(state))
                .req(Query(input))
                .sub(Extension(sub))
                .collection("post_tags")
                .allowed_retrieval_types(&[RetrieveBy::MostUses])
                .base_query(base_query)
                .size_limit(MAX_TAGS_PER_POST) //20 tags at a time
                .build()
                .unwrap()
                .run::<PostTag>()
                .await;
            return response;
        }
    };
}

///These functions are not an api endpoint

pub async fn retrieve_tags_in_bulk(
    tags: Vec<ObjectId>,

    db: Arc<Database>,
    extra_query: Option<Document>,
) -> mongodb::error::Result<Vec<PostTag>> {
    let tags_collection = db.collection::<PostTag>("post_tags");

    // Build the filter: find all documents whose _id is in the given list
    let mut filter = doc! { "_id": { "$in": tags } };
    filter.extend(extra_query.unwrap_or(doc! {}));

    // Execute the query
    let cursor = tags_collection.find(filter).await?;

    // Collect results into a Vec<PostTag>
    let tag_docs: Vec<PostTag> = cursor.try_collect().await?;
    Ok(tag_docs)
}

pub async fn update_tags(
    mut tags: Vec<RequestPostTag>,
    db: Arc<Database>,
    previous_tags: Option<Vec<ObjectId>>,
    user_id: Option<String>,
) -> Result<Vec<PostTag>, Error> {
    fn remove_deduplicate_tags(tags: &mut Vec<RequestPostTag>) {
        let mut seen = std::collections::HashSet::new();
        tags.retain(|tag| seen.insert(tag.tag_name.clone()));
    }

    fn in_tag_list(tag: &RequestPostTag, tag_list: Option<&Vec<PostTag>>) -> bool {
        match tag_list {
            Some(tags) => tags.iter().any(|t| t.tag_name == tag.tag_name),
            None => false,
        }
    }

    remove_deduplicate_tags(&mut tags);

    let previous_tags: Option<Vec<PostTag>> = match previous_tags {
        Some(prev_tag_ids) => {
            let collection: Collection<PostTag> = db.collection("post_tags");

            // Find all tags whose _id is in prev_tag_ids
            let mut cursor = collection
                .find(doc! { "_id": { "$in": prev_tag_ids } })
                .await?;

            let mut tags = Vec::new();
            while let Some(tag) = cursor.try_next().await? {
                tags.push(tag);
            }

            Some(tags)
        }
        None => None,
    };

    match &previous_tags {
        Some(prev_tags) => {
            for prev_tag in prev_tags {
                if !tags.iter().any(|t| {
                    t.tag_name.to_lowercase().trim() == prev_tag.tag_name.to_lowercase().trim()
                }) {
                    // Decrement the uses count for tags that are no longer present
                    let collection = db.collection::<PostTag>("post_tags");
                    let filter = doc! { "tag_name": &prev_tag.tag_name.to_lowercase().trim() };
                    let update = doc! {
                        "$inc": { "uses": -1 }
                    };
                    let _ = collection.update_one(filter, update).await;
                }
            }
        }
        None => {}
    }

    let collection = db.collection::<PostTag>("post_tags");
    let mut actual_tags: Vec<PostTag> = Vec::new();

    // Validate each tag before inserting
    for tag in &tags {
        match tag.validate() {
            Ok(_) => {}
            Err(e) => {
                return Err(Error::from(mongodb::error::ErrorKind::Custom(Arc::new(e))));
            }
        }
    }

    for tag in &tags {
        let filter = doc! { "tag_name": &tag.tag_name.to_lowercase().trim() };

        let mut update = doc! {
            "$setOnInsert": {
                "_id": ObjectId::new(),
                "tag_name": &tag.tag_name.to_lowercase().trim(),
                "color": &tag.color,
                "base_tag": false,
                "created_by": &user_id
            },
            "$inc": { "uses": 1 }
        };
        //only increment when not in previous tags
        if in_tag_list(tag, previous_tags.as_ref()) {
            update = doc! {
                "$setOnInsert": {
                    "_id": ObjectId::new(),
                    "tag_name": &tag.tag_name.to_lowercase().trim(),
                    "color": &tag.color,
                    "base_tag": false,
                    "created_by": &user_id
                },
                "$inc": { "uses": 0 }
            };
        }

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
