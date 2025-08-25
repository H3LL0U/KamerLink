
pub mod api;

pub use api::gamble::*;
pub use api::*;

use utoipa::{OpenApi};

use crate::routes::post::{like::{LikePost, ResponseLikePost}, PostDraft, PostResponse, Posts, RetrieveBy, RetrievePost};



#[derive(OpenApi)]
#[openapi(
    paths(
        gamble,//gamble path
        post::create_post , // post path (post)
        post::retreve_posts, // post path (get)
        post::like::like_post
    ),
    components(
    schemas(
        GambleResults, Gamble, // Gamble schemas
        PostDraft, PostResponse, // Post schemas (post)
        RetrievePost, Posts , RetrieveBy, // Post schemas (get)
        LikePost, ResponseLikePost
    )), 
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;