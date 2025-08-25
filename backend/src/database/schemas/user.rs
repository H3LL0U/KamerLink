

use std::sync::Arc;

use mongodb::{bson::{doc, oid::ObjectId}, options::{CreateCollectionOptions, ValidationAction, ValidationLevel}, Database};
use serde::{Deserialize, Serialize};
use utoipa::{OpenApi, ToSchema};
use anyhow::{anyhow, Context, Result};
use derive_builder::Builder;
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct UserSub{
    pub r#type: String,
    pub sub: String
}

impl TryFrom<&str> for UserSub {
    type Error = anyhow::Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let parts: Vec<&str> = value.split('|').collect();
        if parts.len() != 2 {
            return Err(anyhow!("invalid sub format: expected `type|sub`"));
        }
        Ok(UserSub {
            r#type: parts[0].to_string(),
            sub: parts[1].to_string(),
        })
    }
}


#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct PointsGivenTo{
    post_id: String,
    points: usize
}
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]

pub enum Role {
    Student,
    Teacher,
    Admin
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Builder, Debug)]
#[builder(pattern = "owned")] // make setters take self instead of &mut self
pub struct User {
    // Default empty string
    #[builder(default = "std::string::String::new()", setter(into))]
    pub email: String,

    // Default "New user"
    #[builder(default = "String::from(\"New user\")", setter(into))]
    pub nickname: String,

    // Default Role::Student
    #[builder(default = "Role::Student")]
    pub role: Role,

    // Default false
    #[builder(default)]
    pub is_validated: bool,

    // Default empty Vec
    #[builder(default)]
    pub user_subs: Vec<UserSub>,

    #[builder(default)]
    pub likes: Vec<String>,

    #[builder(default)]
    pub points_given_to: Vec<PointsGivenTo>,

    #[builder(default)]
    pub seen: Vec<String>,

    #[builder(default = 100)]
    pub points: i64

}
#[derive(Debug, serde::Deserialize)]
struct UserIdOnly {
    #[serde(rename = "_id")]
    id: ObjectId,
}


impl User {
    /* 
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
    */
    pub fn new(email: String, nickname: String, user_subs:Vec<UserSub>) -> Self {
        
        
        Self { email: email, 
            nickname: nickname ,
            user_subs: user_subs,
            role: Role::Student,
            is_validated: false,
            likes: Vec::new(),
            points_given_to: Vec::new() ,

            seen: Vec::new(),
        points:100}
            

    }


    

    pub async fn get_user_id_by_sub(
        db: &Arc<Database>,
        user_sub: impl TryInto<UserSub, Error = anyhow::Error>,
    ) -> Result<ObjectId> {
        // Convert input into UserSub
        let user_sub: UserSub = user_sub.try_into()?;

        let collection = db.collection::<UserIdOnly>("users");

        let filter = doc! {
            "user_subs": {
                "$elemMatch": {
                    "type": &user_sub.r#type,
                    "sub": &user_sub.sub
                }
            }
        };

        let user = collection
            .find_one(filter,)
            .await
            .with_context(|| "Failed to query users collection")?;

        Ok(user.map(|u| u.id).ok_or(anyhow!("No id"))?)
    }


}