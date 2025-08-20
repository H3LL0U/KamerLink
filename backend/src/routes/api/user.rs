

/* 
#[utoipa::path(
    get,
    path = "api/gamble",
    security(("bearerAuth" = [])),
    responses(
        (status = 200, description = "Generates a list of numbers from 1 to 7", body = GambleResults),
        (status = 401, description = "Unauthorized - missing or invalid token")
    )
)]
pub async fn gamble( Json(input): Json<Gamble>, ) -> Response {


    // Proceed with the gamble
    let result = match input.gamble_type {
        GambleTypes::Slots => GambleResults {
            slots: Some(rng::generate_slots()),
        },
    };

    Json(result).into_response()
}
*/