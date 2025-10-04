use axum::routing::{get, post};
use axum::{Router, middleware};

use crate::AppState;
use crate::routes::api::post::create_post;
use crate::routes::gamble;
use crate::routes::post::comment::{
    add_reply_to_comment, create_comment, like_comment, retrieve_comments,
};
use crate::routes::post::like::like_post;
use crate::routes::post::points::{check_points, spend_points};
use crate::routes::post::retrieve_posts;
use crate::routes::user::retrieve_users;
use crate::validation::token_validation_middleware;

pub fn build_private_routes(state: &AppState) -> Router {
    Router::new()
        .route("/gamble", post(gamble))
        .route("/post", post(create_post))
        .route("/post", get(retrieve_posts))
        .route("/post/like", post(like_post))
        .route("/post/points", post(spend_points))
        .route("/post/points", get(check_points))
        .route("/user", get(retrieve_users))
        .route("/post/comment", get(retrieve_comments))
        .route("/post/comment", post(create_comment))
        .route("/post/comment/like", post(like_comment))
        .route("/post/comment/reply", post(add_reply_to_comment)) // reusing create_comment for replies
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            token_validation_middleware,
        ))
}

pub fn build_public_routes() -> Router {
    Router::new()
}
