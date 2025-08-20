

use mongodb::{bson::doc, options::{CreateCollectionOptions, ValidationAction, ValidationLevel}};
use serde::{Deserialize, Serialize};
use utoipa::{OpenApi, ToSchema};

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct UserSub{
    pub r#type: String,
    pub sub: String
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct PointsGivenTo{
    post_id: String,
    points: usize
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]

pub struct User{
    email:String,
    nickname: String,
    user_subs: Vec<UserSub>, // Stores which user subs are associated with the user (from google etc...)
    likes: Vec<String>, // Stores which posts were liked by the user
    points_given_to: Vec<PointsGivenTo>,


}
impl User {
    pub fn get_validation_options() -> CreateCollectionOptions {
        let validator = doc! {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["email", "nickname", "user_subs", "likes", "points_given_to"],
                "properties": {
                    "email": { "bsonType": "string" },
                    "nickname": { "bsonType": "string" },
                    "user_subs": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["type", "sub"],
                            "properties": {
                                "type": { "bsonType": "string" },
                                "sub": { "bsonType": "string" }
                            }
                        }
                    },
                    "likes": {
                        "bsonType": "array",
                        "items": { "bsonType": "string" }
                    },
                    "points_given_to": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["post_id", "points"],
                            "properties": {
                                "post_id": { "bsonType": "string" },
                                "points": { "bsonType": "int" }
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

    pub fn new(email: String, nickname: String, user_subs:Vec<UserSub>) -> Self {
        Self { email: email, 
            nickname: nickname ,
             user_subs: user_subs,
              likes: Vec::new(),
               points_given_to: Vec::new() }
    }



}