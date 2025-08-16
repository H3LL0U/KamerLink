use axum::Extension;
use jsonwebtoken::decode_header;
use anyhow::{Context, Ok, Result};
pub mod gamble;
pub mod post;


