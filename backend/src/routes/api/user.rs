use std::str::FromStr;

use crate::database::schemas::post::KamerlinkPost;
use crate::routes::post::Search;
use crate::routes::request_builder::{RetrieveBy, RetrievePaginated, retrieve_items};
use crate::test_utils::setup_test_state;
use crate::{
    AppState,
    database::schemas::user::{User, UserInfo},
    routes::request_builder::*,
};
use axum::extract::Path;
use axum::response::IntoResponse;
use axum::{Extension, response::Response};
use axum_extra::extract::Query;
use http::StatusCode;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
#[utoipa::path(
    get,
    path = "/api/user",
    responses(
        (status = 200, description = "Retrieves users", body = PaginatedResponse<UserInfo>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
    RetrievePaginated
    ),
    description = "Retrieves 5 users"
)]
pub async fn retrieve_users(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrievePaginated>,
) -> Response {
    crate::routes::request_builder::RetrieveItemsBuilder::default()
        .state(Extension(state))
        .sub(Extension(sub))
        .req(Query(req))
        .collection("users")
        .allowed_retrieval_types(&[
            RetrieveBy::_Self,
            RetrieveBy::Id("".to_string()),
            RetrieveBy::MostPoints,
        ])
        .base_query(doc! {})
        .build()
        .unwrap()
        .run::<UserInfo>()
        .await
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct RetrievePosts {
    pub r#type: RetrieveBy,
    pub page: usize,
    pub user_id: String,
}

impl From<RetrievePosts> for RetrievePaginated {
    fn from(value: RetrievePosts) -> Self {
        Self {
            r#type: value.r#type,
            page: value.page,
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/user/{user_id}/posts",
    responses(
        (status = 200, description = "Retrieves users", body = PaginatedResponse<KamerlinkPost>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
   params(
        ("user_id" = String, Path, description = "The id of the user to get the posts from"),
        RetrievePaginated,
        Search
    ),
    description = "Retrieves 5 users"
)]
pub async fn retrieve_user_posts(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Path(user_id): Path<String>,
    Query(req): Query<RetrievePaginated>,
    Query(search): Query<Search>,
) -> Response {
    let mut base_query = match search.search {
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
    base_query.extend(doc! {"user_id": user_id});
    crate::routes::request_builder::RetrieveItemsBuilder::default()
        .state(Extension(state))
        .sub(Extension(sub))
        .req(Query(req.clone().into()))
        .collection("posts")
        .allowed_retrieval_types(&[
            RetrieveBy::MostPoints,
            RetrieveBy::MostLikes,
            RetrieveBy::MostRecent,
        ])
        .base_query(base_query)
        .build()
        .unwrap()
        .run::<KamerlinkPost>()
        .await
}
