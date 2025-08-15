
pub mod gamble;
pub use gamble::*;

use utoipa::{OpenApi};



#[derive(OpenApi)]
#[openapi(
    paths(gamble),
    components(schemas(GambleResults, Gamble)),
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;