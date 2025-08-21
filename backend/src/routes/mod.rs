
pub mod api;

pub use api::gamble::*;
pub use api::*;

use utoipa::{OpenApi};

use crate::routes::post::{PostDraft, PostResponse, RetrievePost, Posts, RetrieveBy};



#[derive(OpenApi)]
#[openapi(
    paths(
        gamble,//gamble path
        post::create_post , // post path (post)
        post::retreve_posts // post path (get)
    ),
    components(
    schemas(
        GambleResults, Gamble, // Gamble schemas
        PostDraft, PostResponse, // Post schemas (post)
        RetrievePost, Posts , RetrieveBy // Post schemas (get)
    )), 
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;