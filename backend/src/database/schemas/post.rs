use mongodb::{
    bson::{doc, Document},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize)]
pub struct Comment {
    user_sub: String,
    message: String,
    replies: Vec<Comment>, // Threaded comments
}

#[derive(Serialize, Deserialize)]
pub struct InfraStemPost {
    pub user_sub: String, // Who made the post
    pub created_at: String, // when was the post created
    pub title: String,
    pub message: String,
    pub img_urls: Vec<String>,
    pub likes: usize,
    pub points: usize,
    pub goal: Option<usize>,
    pub comments: Vec<Comment>,
    pub location: Option<Location>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct Location {
    pub r#type: String,        // typically "Point"
    pub coordinates: [f64; 2], // [longitude, latitude]
}

impl InfraStemPost {
    pub fn get_validation_options() -> CreateCollectionOptions {
        let validator = doc! {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["user_sub", "title", "message", "img_urls", "likes", "points"],
                "properties": {
                    "user_sub": { "bsonType": "string" },
                    "created_at": { "bsonType": "string" },
                    "title": { "bsonType": "string", "maxLength": 100 },
                    "message": { "bsonType": "string", "maxLength": 1000 },
                    "img_urls": {
                        "bsonType": "array",
                        "items": { "bsonType": "string" }
                    },
                    "likes": { "bsonType": "long" },
                    "points": { "bsonType": "long" },
                    "goal": { "bsonType": ["int", "null"] },
                    "comments": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["user_sub", "message"],
                            "properties": {
                                "user_sub": { "bsonType": "string" },
                                "message": { "bsonType": "string", "maxLength": 500 },
                                "replies": { "bsonType": "array" } 
                            }
                        }
                    },
                    "location": {
                        "bsonType": ["object", "null"],
                        "properties": {
                            "type": { "enum": ["Point"] },
                            "coordinates": {
                                "bsonType": "array",
                                "items": [
                                    { "bsonType": "double" },
                                    { "bsonType": "double" }
                                ]
                            }
                        }
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
