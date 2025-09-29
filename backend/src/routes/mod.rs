pub mod api;
pub mod request_builder;
pub use api::gamble::*;
pub use api::*;
use serde::Serialize;
pub use user;
use utoipa::{
    Modify, OpenApi,
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
};

use crate::routes::post::{
    PostDraft, PostResponse,
    like::{LikePost, ResponseLikePost},
};
use request_builder::{RetrieveBy, RetrievePaginated};

//pub fn get_jwt_configuration () -> SecurityScheme

//{SecurityScheme::Http(HttpBuilder::new().scheme(HttpAuthScheme::Bearer).bearer_format("JWT").build())}

#[derive(Debug, Serialize)]
struct JwtAuth;

impl Modify for JwtAuth {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearerAuth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer) // use Bearer
                        .bearer_format("JWT") // show "JWT" in docs
                        .build(),
                ),
            );
        }
    }
}

#[derive(OpenApi)]
#[openapi(
    // All of the endpoints should be specified here
    paths(
        gamble,//gamble path (post)
        post::create_post , // post path (post)
        post::retrieve_posts, // post path (get)
        post::like::like_post, // like path (post)
        post::points::spend_points, // give points path (post)
        post::points::check_points, // check how many points was given (get)
        post::comment::create_comment, // creates a comment under a post (post)
        post::comment::retrieve_comments, // retrieves comments based on the specified parameters (get)
        user::retrieve_users // user path (get)
        

    ),
    components(
    schemas(
        GambleResults, Gamble, // Gamble schemas
        PostDraft, PostResponse, // Post schemas (post)
        RetrievePaginated , RetrieveBy, // Post schemas (get)
        LikePost, ResponseLikePost
        
    ),
    ),
    modifiers(&JwtAuth),               
    security(("bearerAuth" = [])),
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;
