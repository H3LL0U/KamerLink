use std::net::IpAddr;

use axum::routing::{delete, get, patch, post};
use axum::{Router, middleware};

use tower_governor::GovernorError;
use tower_governor::governor::GovernorConfig;
use tower_governor::{GovernorLayer, governor::GovernorConfigBuilder};

use crate::AppState;
use crate::middleware::token_validation_middleware;
use crate::routes::api::post::create_post;
use crate::routes::api::post::tags::retrieve_tags;
use crate::routes::gamble;
use crate::routes::post::comment::{
    add_reply_to_comment, create_comment, like_comment, retrieve_comments,
};

use crate::routes::post::like::like_post;
use crate::routes::post::points::{check_points, spend_points};
use crate::routes::post::{delete_post, retrieve_posts, update_post};
use crate::routes::user::{retrieve_user_posts, retrieve_users};

use axum::http::Request;
use tower_governor::key_extractor::KeyExtractor;

#[derive(Clone)]
//Labels users for their Authorization header for rate limiting
struct AuthHeaderKeyExtractor;

impl KeyExtractor for AuthHeaderKeyExtractor {
    type Key = String;

    fn extract<B>(&self, req: &Request<B>) -> Result<String, GovernorError> {
        // Try Authorization header first
        if let Some(auth) = req.headers().get("authorization") {
            if let Ok(auth_str) = auth.to_str() {
                return Ok(auth_str.to_string());
            }
        }

        // Fallback to IP address
        let ip: IpAddr = req
            .extensions()
            .get::<std::net::SocketAddr>()
            .map(|addr| addr.ip())
            .unwrap_or_else(|| "127.0.0.1".parse().unwrap());

        Ok(ip.to_string())
    }
}

pub fn build_private_routes(state: &AppState) -> Router {
    //Posts that need to have rate limiting set up

    let secure_governor_conf = GovernorConfigBuilder::default()
        .per_second(10)
        .burst_size(3)
        .key_extractor(AuthHeaderKeyExtractor)
        .finish()
        .unwrap();

    let common_router_conf = GovernorConfigBuilder::default()
        .per_millisecond(3)
        .burst_size(400)
        .key_extractor(AuthHeaderKeyExtractor)
        .finish()
        .unwrap();

    let secure_router: Router = Router::new()
        .route("/post/comment/reply", post(add_reply_to_comment))
        .route("/post/comment", post(create_comment))
        .route("/post", post(create_post))
        .route("/post", patch(update_post))
        .route("/post", delete(delete_post))
        .layer(GovernorLayer::new(secure_governor_conf));
    let common_router = Router::new()
        .route("/gamble", post(gamble))
        .route("/post/points", post(spend_points))
        .route("/post/comment/like", post(like_comment))
        .route("/post", get(retrieve_posts))
        .route("/post/like", post(like_post))
        .route("/post/points", get(check_points))
        .route("/user", get(retrieve_users))
        .route("/post/comment", get(retrieve_comments))
        .route("/user/{user_id}/posts", get(retrieve_user_posts))
        .route("/post/tags/{post_id}", get(retrieve_tags)) // both of these routes map to the same function
        .route("/post/tags/", get(retrieve_tags)) // both of these routes map to the same function
        .layer(GovernorLayer::new(common_router_conf));

    Router::new()
        .merge(secure_router)
        .merge(common_router)
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            token_validation_middleware,
        ))
}

pub fn build_public_routes() -> Router {
    Router::new()
}
