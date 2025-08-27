
pub mod api;

pub use api::gamble::*;
pub use api::*;

use serde::Serialize;
use utoipa::{openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme}, Modify, OpenApi};

use crate::routes::post::{like::{LikePost, ResponseLikePost}, PostDraft, PostResponse, Posts, RetrieveBy, RetrievePost};

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
                        .bearer_format("JWT")           // show "JWT" in docs
                        .build(),
                ),
            );
        }
    }
}





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
    ),
    ),
    modifiers(&JwtAuth),               
    security(("bearerAuth" = [])),
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;