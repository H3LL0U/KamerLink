

pub mod auth;
pub use auth::*;
pub mod gamble;
pub use gamble::*;

use utoipa::{OpenApi};



#[derive(OpenApi)]
#[openapi(
    paths(gamble,auth_login, get_token),
    components(schemas(GambleResults, Gamble, Auth0Code)),
    info(title = "InfraStemAPI", version = "1.0.0")
)]
pub struct ApiDoc;