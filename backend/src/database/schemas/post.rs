use mongodb::{
    bson::{doc, oid::ObjectId, Document},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
use utoipa::{openapi::Object, ToSchema};

use crate::database::ObjectIdSchema;
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct Comment {
    user_id: String,
    message: String,
    replies: Vec<Reply>, // Threaded comments might be implemented later (Vec<Comment> instead) 
}
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct Reply{
    user_id: String,
    message: String
}





#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct KamerlinkPost {

    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,
    pub user_id: String, // Who made the post
    pub created_at: String, // when was the post created
    pub title: String,
    pub message: String,
    pub img_urls: Vec<String>,
    pub likes: usize,
    pub points: usize,
}


