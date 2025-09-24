use anyhow::{Context, Ok, Result};
use axum::Extension;
use jsonwebtoken::decode_header;
pub mod gamble;
pub mod post;
pub mod user;
