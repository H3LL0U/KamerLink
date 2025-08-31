use serde::{Deserialize, Serialize};
use utoipa::ToSchema;


pub mod schemas;

#[derive(Serialize, Deserialize, Clone, ToSchema, Debug)]
struct ObjectIdSchema{
    #[serde(rename = "$oid")]
    #[schema(value_type = String, rename = "$oid")]
    oid: String
}