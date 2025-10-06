use crate::{AppState, database::schemas::user::UserSub, get_jwks};
use anyhow::Result;
use dotenv::dotenv;

use crate::database::schemas::user::{User, UserBuilder};
use mongodb::{Client, Database, results::InsertOneResult};
use std::sync::Arc;

use jsonwebtoken::jwk::{Jwk, JwkSet};
use serde_json::json;

// Might be used in the future

pub fn build_dummy_jwkset() -> JwkSet {
    let jwk_json = json!({
        "kty": "RSA",
        "use": "sig",
        "kid": "dummy-kid",
        "alg": "RS256",
        "n": "somerandombase64urlstring",
        "e": "AQAB"
    });

    let jwk: Jwk = serde_json::from_value(jwk_json).unwrap();
    JwkSet { keys: vec![jwk] }
}
/// Creates a dummy user in the database for testing purposes
pub async fn create_dummy_user(
    db: Arc<Database>,
    user_sub: &str,
    email: &str,
) -> Result<InsertOneResult> {
    let users_collection = db.collection::<User>("users");
    let user = UserBuilder::default()
        .user_subs(vec![UserSub::try_from(user_sub).unwrap()])
        .email(email)
        .build()
        .unwrap();
    let insert_result = users_collection.insert_one(user).await?;
    Ok(insert_result)
}
/// Sets up the test database and returns the AppState that is later used by the endpoints
/// Also inserts dummy users into the database
/// with email email1.o2g2.nl, email2.o2g2.nl, email3.o2g2.nl
pub async fn setup_test_state() -> Result<AppState> {
    dotenv().ok();

    let mongo_uri =
        std::env::var("MONGO_DB_TEST").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let client = Client::with_uri_str(&mongo_uri).await?;
    let db: Arc<Database> = Arc::new(client.database("kamerlink_test"));

    // Clear existing collections
    for name in ["users", "posts", "post_tags", "reset_counter", "comments"] {
        if db
            .collection::<mongodb::bson::Document>(name)
            .drop()
            .await
            .is_err()
        {
            // Ignore errors if the collection does not exist
        }
    }

    // Setup dummy 3 users
    for i in 1..=3 {
        let user_sub = format!("auth0|testuser{}", i);
        let email = format!("email{}.o2g2.nl", i);
        let _ = create_dummy_user(db.clone(), user_sub.as_str(), email.as_str())
            .await
            .unwrap();
    }

    // Load JWKS and build AppState
    //jwk is only used for validation middleware, so we can use a dummy one here
    let jwks = Arc::new(build_dummy_jwkset());
    let session = Arc::new(client.start_session().await?);

    Ok(AppState {
        jwks,
        db: db,
        session,
    })
}
