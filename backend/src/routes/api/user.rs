use crate::routes::request_builder::{RetrieveBy, RetrievePaginated, retrieve_items};
use crate::{
    AppState,
    database::schemas::user::{User, UserInfo},
    routes::request_builder::*,
};
use axum::{Extension, response::Response};
use axum_extra::extract::Query;
use mongodb::bson::doc;
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
