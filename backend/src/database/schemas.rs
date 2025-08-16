use mongodb::{
    bson::{doc, Document},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize)]
pub struct InfraStemPost {
    //pub post_id: rely on _id
    pub user_sub: String,
    pub title: String,
    pub message: String,
    pub img_urls: Vec<String>,
}

impl InfraStemPost {
    pub fn get_validation_options() -> CreateCollectionOptions {
        let validator = doc! {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["post_id", "user_sub", "title", "message", "img_urls"],
                "properties": {
                    "user_sub": { "bsonType": "string" },
                    "title": { "bsonType": "string", "maxLength": 100 },
                    "message": { "bsonType": "string", "maxLength": 1000 },
                    "img_urls": {
                        "bsonType": "array",
                        "items": { "bsonType": "string" }
                    }
                }
            }
        };

        CreateCollectionOptions::builder()
            .validator(Some(validator))           
            .validation_level(ValidationLevel::Strict)
            .validation_action(ValidationAction::Error)
            .build()
    }
}
