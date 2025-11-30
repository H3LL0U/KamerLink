use crate::database::ObjectIdSchema;
use anyhow::{Context, Result, anyhow};
use chrono::Utc;
use derive_builder::Builder;
use mongodb::{
    Database,
    bson::{doc, oid::ObjectId},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use substruct::substruct;
use utoipa::{OpenApi, ToSchema};
use validator::Validate;

#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct UserSub {
    pub r#type: String,
    pub sub: String,
}
impl UserSub {
    pub fn to_string(&self) -> String {
        format!("{}|{}", self.r#type, self.sub)
    }
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
pub struct PointsGivenTo {
    post_id: String,
    points: usize,
}
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]

pub enum Role {
    Student,
    Teacher,
    Admin,
}

impl Role {
    fn user_role_value(&self) -> i32 {
        match self {
            Role::Student => 1,
            Role::Teacher => 2,
            Role::Admin => 3,
        }
    }

    fn is_higher_than(&self, other: &Role) -> bool {
        self.user_role_value() > other.user_role_value()
    }
}
#[substruct(BanStatusDraft)]
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug, Validate)]
pub struct BanStatus {
    #[substruct(BanStatusDraft)]
    #[validate(length(min = 0, max = 1000))]
    pub description: String,
    #[substruct(BanStatusDraft)]
    pub banned_until: i64, //utc timestamp
    #[validate(length(min = 0, max = 100))]
    pub banned_by: Option<String>, //id
}

impl BanStatus {
    pub fn is_active(&self) -> bool {
        let current_timestamp = Utc::now().timestamp();

        self.banned_until > current_timestamp
    }
}

pub trait CanBan {
    fn can_ban(&self, user: &User) -> bool;
}
#[substruct(UserInfo)] // Defines a safe struct that only contains public user info
#[derive(Serialize, Deserialize, Clone, ToSchema, Builder, Debug)]
#[builder(pattern = "owned")]
pub struct User {
    #[substruct(UserInfo)]
    #[builder(default = "ObjectId::new()", setter(into))]
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,

    // Default empty string
    #[builder(default = "std::string::String::new()", setter(into))]
    pub email: String,

    // Default "New user"
    #[substruct(UserInfo)]
    #[builder(default = "String::from(\"New user\")", setter(into))]
    pub nickname: String,

    // Default Role::Student
    #[substruct(UserInfo)]
    #[builder(default = "Role::Student")]
    pub role: Role,

    // Default false
    #[substruct(UserInfo)]
    #[builder(default)]
    pub is_validated: bool,

    // Default empty Vec
    #[builder(default)]
    pub user_subs: Vec<UserSub>,

    #[builder(default)]
    pub likes: Vec<String>,

    #[builder(default)]
    pub comment_likes: Vec<String>,

    #[schema(value_type = HashMap<ObjectIdSchema, i64>)]
    #[builder(default)]
    pub points_given_to: HashMap<ObjectId, i64>, // key = post_id, value = points

    #[builder(default)]
    pub seen: Vec<String>, //unused for now

    #[substruct(UserInfo)]
    #[builder(default = 100)]
    pub points: i64,

    #[substruct(UserInfo)]
    #[builder(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub received_points: Option<i64>,

    #[substruct(UserInfo)]
    #[builder(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub received_likes: Option<i64>,

    #[substruct(UserInfo)]
    #[builder(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ban_status: Option<BanStatus>,
}

impl CanBan for User {
    fn can_ban(&self, user_to_ban: &User) -> bool {
        if user_to_ban.role.is_higher_than(&self.role) || user_to_ban._id == self._id {
            return false;
        }
        true
    }
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
    pub fn new(email: String, nickname: String, user_subs: Vec<UserSub>) -> Self {
        Self {
            _id: ObjectId::new(),
            email: email,
            nickname: nickname,
            user_subs: user_subs,
            role: Role::Student,
            is_validated: false,
            likes: Vec::new(),
            comment_likes: Vec::new(),
            points_given_to: HashMap::new(),
            seen: Vec::new(),
            points: 100,
            received_likes: None,
            received_points: None,
            ban_status: None,
        }
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
            .find_one(filter)
            .await
            .with_context(|| "Failed to query users collection")?;

        Ok(user.map(|u| u.id).ok_or(anyhow!("No id"))?)
    }

    pub async fn get_user_by_sub(
        db: &Arc<Database>,
        user_sub: impl TryInto<UserSub, Error = anyhow::Error>,
    ) -> Result<User> {
        // Convert input into UserSub
        let user_sub: UserSub = user_sub.try_into()?;

        let collection = db.collection::<User>("users");

        let filter = doc! {
            "user_subs": {
                "$elemMatch": {
                    "type": &user_sub.r#type,
                    "sub": &user_sub.sub
                }
            }
        };

        let user = collection
            .find_one(filter)
            .await
            .with_context(|| "Failed to query users collection")?;

        Ok(user.ok_or(anyhow!("No user found"))?)
    }

    pub async fn get_user_by_id(db: &Arc<Database>, user_id: &str) -> Result<User> {
        let collection = db.collection::<User>("users");

        let oid = ObjectId::parse_str(user_id)
            .with_context(|| format!("Failed to parse user_id `{}` as ObjectId", user_id))?;

        let filter = doc! {
            "_id": oid
        };

        let user = collection
            .find_one(filter)
            .await
            .with_context(|| "Failed to query users collection")?;

        Ok(user.ok_or(anyhow!("No user found"))?)
    }
}
