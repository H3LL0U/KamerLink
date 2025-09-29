use crate::errors::KamerlinkError;
use crate::{
    AppState,
    database::schemas::{post::KamerlinkPost, user::User},
};
use anyhow::anyhow;
use axum::{
    Extension, Json,
    response::{IntoResponse, Response},
};
use axum_extra::extract::Query;
use http::StatusCode;
use mongodb::bson::{self, Bson, Document, doc, oid::ObjectId};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{error::Error, str::FromStr};
use tower_http::limit;
use utoipa::ToSchema;

pub const MAX_POINTS_ALLOWED: usize = 100;

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct GivePoints {
    points: i64,
    post_id: String,
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct ResponseGivePoints {
    status: Option<KamerlinkError>,
}

#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/api/post/points",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Gives Points to a specific post", body = ResponseGivePoints),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    request_body = GivePoints
)]
pub async fn spend_points(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Json(input): Json<GivePoints>,
) -> Response {
    let cur_user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let post_id = match ObjectId::from_str(&input.post_id) {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let mut session = match state.db.client().start_session().await {
        Ok(k) => k,
        Err(_) => {
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let _ = match session
        .start_transaction()
        .and_run2(async move |client_session: &mut mongodb::ClientSession| {
            let db = client_session.client().database("kamerlink");
            let collection = db.collection::<Document>("users");
            let posts_collection = db.collection::<KamerlinkPost>("posts");
            //update points_given_to for the user
            let filter = doc! {
                "_id": &cur_user_id,
                "points": { "$gte": input.points as i64 }, // check if the user has enough points

            };
            //updates the value of the post
            let update_post = doc! {
                "$inc": {
                    format!("points_given_to.{}", input.post_id): input.points as i64, // add/increment to a new post that the user has given points to
                    "points": -(input.points as i64) //decrement points from user
                }
            };

            match collection
                .find_one(filter)
                .projection(doc! {format!("points_given_to.{}", input.post_id):1 , "_id":0})
                .await
            {
                Ok(Some(doc)) => {
                    let points_given_to: &Document = match doc.get("points_given_to") {
                        Some(Bson::Document(d)) => d,
                        _ => &Document::new(), // empty Document if missing or wrong type
                    };

                    //check if a user is allowed to make a transaction
                    if let Some(Bson::Int64(user_points)) = points_given_to.get(&input.post_id) {
                        if (MAX_POINTS_ALLOWED as i64) < *user_points + input.points
                            || *user_points + input.points < 0
                        {
                            return Err(mongodb::error::Error::from(std::io::Error::new(
                                std::io::ErrorKind::Other,
                                "More points spent on post than allowed",
                            )));
                        }
                    } else {
                        if (MAX_POINTS_ALLOWED as i64) < input.points || input.points < 0 {
                            return Err(mongodb::error::Error::from(std::io::Error::new(
                                std::io::ErrorKind::Other,
                                "More points spent on post than allowed",
                            )));
                        }
                    }
                    let filter = doc! {
                        "_id": &cur_user_id,
                        "points": { "$gte": input.points as i64 }, // check if the user has enough points

                    };
                    //update the post on the user profile
                    collection.update_one(filter, update_post).await?;

                    //update the ammount of points that a post has recieved
                    let _ = posts_collection
                        .find_one_and_update(
                            doc! {"_id": &post_id, },
                            doc! {"$inc": {"points": input.points as i64}},
                        )
                        .await?;
                }
                Ok(None) => {
                    return Err(mongodb::error::Error::from(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        "user not found or more points given than expected",
                    )));
                }
                Err(e) => return Err(e),
            }

            Ok(())
        })
        .await
    {
        Ok(_) => {
            return Json(ResponseGivePoints { status: None }).into_response();
        }
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "err": e.to_string() })),
            )
                .into_response();
        }
    };
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct CheckPointsQuery {
    post_id: String,
}
#[derive(Serialize, Deserialize, Clone, ToSchema)]
struct GivenPoints {
    points_given: i64,
    limit: i64,
}

#[axum::debug_handler]
#[utoipa::path(
    get,
    path = "/api/post/points",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Returns how many points a specific user has spent on a post", body = GivenPoints),
        (status = 401, description = "Unauthorized - missing or invalid token")
    ),
    params(
        ("post_id" = String, Query, description = "Type of retrieval"),

    ),
)]
pub async fn check_points(
    Extension(sub): Extension<String>,
    Extension(state): Extension<AppState>,
    Query(req): Query<CheckPointsQuery>,
) -> Response {
    let cur_user_id = match User::get_user_id_by_sub(&state.db, sub.as_str()).await {
        Ok(k) => k,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let collection = state.db.collection::<Document>("users");

    let filter = doc! { "_id": &cur_user_id };

    match collection
        .find_one(filter)
        .projection(doc! { format!("points_given_to.{}", req.post_id): 1, "_id": 0 })
        .await
    {
        Ok(Some(doc)) => {
            let points_given_to: &Document = match doc.get("points_given_to") {
                Some(Bson::Document(d)) => d,
                _ => &Document::new(),
            };

            if let Some(Bson::Int64(user_points)) = points_given_to.get(&req.post_id) {
                Json(GivenPoints {
                    points_given: *user_points,
                    limit: MAX_POINTS_ALLOWED as i64,
                })
                .into_response()
            } else {
                Json(GivenPoints {
                    points_given: 0,
                    limit: MAX_POINTS_ALLOWED as i64,
                })
                .into_response()
            }
        }
        Ok(None) => Json(GivenPoints {
            points_given: 0,
            limit: MAX_POINTS_ALLOWED as i64,
        })
        .into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "err": e.to_string() })),
        )
            .into_response(),
    }
}
