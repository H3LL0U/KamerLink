/// This file contains functions for reset which happens every 7PM
///
use anyhow::anyhow;
use chrono::{Duration, Local, TimeZone};
use mongodb::Database;
use mongodb::bson::{Document, doc, to_document};
use serde::{Deserialize, Serialize};

use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::{self, SystemTime, UNIX_EPOCH};
use tokio::time::{Instant, sleep_until};
use utoipa::ToSchema;

const RESET_POINTS_COUNT: i64 = 100;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ResetDocument {
    pub time: SystemTime,
}

///finds the next time at 7PM locally
pub fn get_next_reset_time() -> chrono::DateTime<Local> {
    let now = Local::now();

    // Start with today at 19:00:00
    let today_7pm = now.date_naive().and_hms_opt(19, 0, 0).unwrap();
    let today_7pm = Local.from_local_datetime(&today_7pm).unwrap();

    if now < today_7pm {
        today_7pm
    } else {
        // add 1 day and set to 19:00
        let tomorrow = now.date_naive() + Duration::days(1);
        let tomorrow_7pm = tomorrow.and_hms_opt(19, 0, 0).unwrap();
        Local.from_local_datetime(&tomorrow_7pm).unwrap()
    }
}

///Finds current next reset time in the database and if it does not exist sets it
pub async fn get_cur_reset_time(db: Arc<Database>) -> anyhow::Result<ResetDocument> {
    let collection = db.collection::<ResetDocument>("reset_counter");

    let next_reset = match collection.find_one(doc! {}).await {
        Ok(k) => k,
        Err(_) => return Err(anyhow!("Error getting when fetching the document")),
    };

    match next_reset {
        Some(n) => Ok(n),
        None => {
            // If none was found automatically set it
            let default_time = ResetDocument {
                time: get_next_reset_time().into(),
            };

            match collection.insert_one(&default_time).await {
                Ok(k) => k,
                Err(_) => return Err(anyhow!("Error inserting time")),
            };
            return Ok(default_time);
        }
    }
}
///Triggers the reset
pub async fn trigger_reset(db: Arc<Database>) {
    let users_collection = db.collection::<mongodb::bson::Document>("users");

    let filter = doc! { "points": { "$lt": RESET_POINTS_COUNT } };
    let update = doc! { "$set": { "points": RESET_POINTS_COUNT } };

    let _ = match users_collection.update_many(filter, update).await {
        Ok(result) => dbg!(format!(
            "Updated reset applied to {} users",
            result.modified_count
        )),
        Err(err) => dbg!(format!("Failed to update users {:?}", err)).to_string(),
    };
    // update the reset_counter

    let reset_counter_collection = db.collection::<Document>("reset_counter");

    let next_reset_time = ResetDocument {
        time: get_next_reset_time().into(),
    };
    let next_reset_time_doc = match to_document(&next_reset_time) {
        Ok(k) => k,
        Err(_) => {
            dbg!("could not transform into document during reset");
            return;
        }
    };
    match reset_counter_collection
        .replace_one(doc! {}, next_reset_time_doc)
        .await
    {
        Ok(k) => (),
        Err(e) => {
            dbg!("could not update the reset counter");
            return ();
        }
    };
}
///Schedules the reset at some time and reschedules for the next day automatically
pub fn schedule_reset(
    when: SystemTime,
    db: Arc<Database>,
) -> Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        dbg!(format!("Reset scheduled at {:?}", &when));

        let now = SystemTime::now();
        let delay = match when.duration_since(now) {
            Ok(dur) => dur,
            Err(_) => std::time::Duration::from_secs(0),
        };
        dbg!(format!("seconds until reset:{:?}", &delay));
        tokio::time::sleep(delay).await;

        // Perform the reset directly (no tokio::spawn)
        trigger_reset(db.clone()).await;

        // Schedule the next reset recursively
        let next_schedule = get_next_reset_time();
        schedule_reset(next_schedule.into(), db.clone()).await;
    })
}
