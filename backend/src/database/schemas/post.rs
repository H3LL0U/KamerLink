use crate::database::ObjectIdSchema;
use derive_builder::Builder;
use mongodb::{
    bson::{Document, doc, oid::ObjectId},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
use substruct::substruct;
use utoipa::{ToSchema, openapi::Object};

#[builder(setter(strip_option))]
#[substruct(Reply, CommentDraft)]
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug, Builder)]

pub struct Comment {
    #[builder(default = "ObjectId::new()", setter(into))]
    #[substruct(Reply)]
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,

    #[substruct(Reply)]
    pub user_id: String,

    #[substruct(Reply, CommentDraft)]
    pub post_id: String,

    #[substruct(Reply, CommentDraft)]
    pub message: String,

    #[substruct(Reply)]
    pub created_at: String,

    #[builder(default = 0)]
    #[substruct(Reply)]
    pub likes: usize,

    #[builder(default)]
    pub replies: Vec<Reply>, // Threaded comments might be implemented later (Vec<Comment> instead)
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
pub struct KamerlinkPost {
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,
    pub user_id: String,    // Who made the post
    pub created_at: String, // when was the post created
    pub title: String,
    pub message: String,
    pub img_urls: Vec<String>,
    pub likes: usize,
    pub points: usize,
}
