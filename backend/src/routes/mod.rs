
pub mod api;

pub use api::gamble::*;
pub use api::*;
use utoipa::{OpenApi};

use crate::routes::post::{PostDraft, PostResponse};



#[derive(OpenApi)]
#[openapi(
    paths(gamble,post::create_post),
    components(schemas(GambleResults, Gamble, PostDraft, PostResponse)),
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;