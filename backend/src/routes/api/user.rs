use axum::{Extension, extract::Query, response::Response};

use crate::routes::request_builder::{RetrieveBy, RetrievePaginated, retrieve_items};
use crate::{
    AppState,
    database::schemas::user::{User, UserInfo},
    routes::request_builder::*,
};
#[utoipa::path(
    get,
    path = "/api/user",
    responses(
        (status = 200, description = "Retrieves users", body = PaginatedResponse<UserInfo>),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
        ("type" = RetrieveBy, Query, description = "Type of retrieval"),
        ("page" = usize, Query, description = "Page number for pagination")
    ),


    description = "Retrieves 5 users"
)]
pub async fn retrieve_users(
    Extension(state): Extension<AppState>,
    Extension(sub): Extension<String>,
    Query(req): Query<RetrievePaginated>,
) -> Response {
    retrieve_items::<UserInfo>(Extension(state), Extension(sub), Query(req), "users").await
}
