use crate::database::ObjectIdSchema;
use crate::routes::api::post::tags::MAX_TAGS_PER_POST;
use derive_builder::Builder;
use mongodb::{
    bson::{Document, doc, oid::ObjectId},
    options::{CreateCollectionOptions, ValidationAction, ValidationLevel},
};
use serde::{Deserialize, Serialize};
use substruct::substruct;
use utoipa::{ToSchema, openapi::Object};
use validator::Validate;
#[substruct(Reply, CommentDraft)]
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug, Builder, Validate)]
#[builder(setter(strip_option))]
pub struct Comment {
    #[builder(default = "ObjectId::new()", setter(into))]
    #[substruct(Reply)]
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,

    #[substruct(Reply)]
    pub user_id: String,

    #[substruct(CommentDraft)]
    pub post_id: String,

    #[substruct(Reply, CommentDraft)]
    #[validate(length(min = 0, max = 5000))]
    pub message: String,

    #[substruct(Reply)]
    pub created_at: String,

    #[builder(default = 0)]
    #[substruct(Reply)]
    pub likes: usize,

    #[builder(default)]
    #[validate(length(max = 500))]
    pub replies: Vec<Reply>, // Threaded comments might be implemented later (Vec<Comment> instead)
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Debug, Builder, Validate)]
pub struct KamerlinkPost {
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,
    pub user_id: String,    // Who made the post
    pub created_at: String, // when was the post created
    #[validate(length(min = 0, max = 100))]
    pub title: String,
    #[validate(length(min = 0, max = 5000))]
    pub message: String,
    #[validate(length(min = 0, max = 10))]
    pub img_urls: Vec<String>,
    #[builder(default)]
    pub likes: usize,
    #[builder(default)]
    pub points: usize,

    #[builder(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[validate(length(min = 0, max = 50))]
    #[schema(value_type = Option<Vec<ObjectIdSchema>>)]
    pub tags: Option<Vec<ObjectId>>,

    pub comment_count: Option<usize>,
}
#[substruct(RequestPostTag)]
#[derive(Serialize, Deserialize, Clone, ToSchema, Debug, Validate)]

pub struct PostTag {
    #[schema(value_type = ObjectIdSchema)]
    pub _id: ObjectId,
    #[substruct(RequestPostTag)]
    #[validate(length(min = 1, max = 50))]
    pub tag_name: String,
    #[substruct(RequestPostTag)]
    #[validate(length(min = 0, max = 10))]
    pub color: String,
    pub base_tag: bool,
    pub uses: usize,
}

impl Into<PostTag> for RequestPostTag {
    fn into(self) -> PostTag {
        PostTag {
            _id: ObjectId::new(),
            tag_name: self.tag_name,
            color: self.color,
            base_tag: false,
            uses: 1,
        }
    }
}
