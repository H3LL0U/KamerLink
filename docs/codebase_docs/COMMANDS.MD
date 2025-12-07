# Commands

This file contains helpful commands and prerequisites to run the project locally.

## Prerequisites

- MongoDB (optional if you want to run a database locally)
- Cargo (to run the backend)
- npm or any other package manager (to run the frontend)


## Commands and prerequisites for launching the site

### Backend

Firstly, it is required that you setup a .env file in the backend directory. You can use example.env as the baseline.
(just create it in the same directory as example.env)

```
(An Auth0 Issuer and audience that you want to use. Can be left as default, but it is required that the users that access the backend are logged in through that issuer. In this case Kamerlink Service)
ISSUER=https://dev-ptvxswasjjfxn7s4.us.auth0.com/  
AUDIENCE=https://dev-ptvxswasjjfxn7s4.us.auth0.com/api/v2/


(MongoDB login url. Can remain default if the database is hosted locally)
MONGO_DB=mongodb://localhost:27017
```

Then you can run one of the following commands in the backend directory

for development purposes
```
cargo run dev
```
or
for deployment
```
cargo run --release
```

You can test if the backend is operating by visiting http://localhost:5000/docs


### Frontend

You can run the following command from the frontend directory
```
npm run dev
```

### Database

You might want to setup the database with some test users  in the beginning that are allowed:

1. Create a database called kamerlink (using tools such as mongoDB compass)
2. Create a collection called users
3. select Add Data and import a kamerlink.users.json in that collection
4. You can modify the user to include the e-mail that you want


## Commands that are needed for development

If you want to add an endpoint:
1. You need to create it in backend/src/routes/api/{endpoint}.rs

example:
```
pub fn generate_list() -> Vec<u8> {
    let mut rng = rand::rng();

    //generate 3 numbers from one to (including) 7
    let numbers: Vec<u8> = (1..=7).map(|_| rng.random_range(1..=3)).collect();
    numbers
}

pub struct EndpointResults {
    pub(crate) number_list: Option<Vec<u8>>,
}

// api/endpoint
// must use an utopia atribute for every function to generate OpenAPI for the frontend
#[utoipa::path(
    post,
    path = "/api/endpoint",
    request_body(
        content_type = "application/json",
        description = "Type of endpoint",
        
    ),
    
    responses(
        (status = 200, description = "Generates a list of numbers from 1 to 7", body = EndpointResults),
        
    )
)]
pub async fn endpoint(Json(input): Json<endpoint>) -> Response {
    let result = EndpointResults {
            number_list: Some(generate_list()),
        }
    Json(result).into_response()
}

```

2. It is then needed to be added in backend/src/routes/mod.rs along the other functions.

3. You can then add it in backend/src/routes_builder.rs to other relevant endpoints (they are separated on how much rate-limiting should be applied to them)

The second step is needed so that openapi.json can be generated. It contains all the information about the endpoints and can later be used on the frontend to automatically generate functions that call that endpoint

To do that just run the following command in the frontend directory:

```
npm run apigen
```

You can then create a fetcher function for the related endpoint in frontend/src/api/{endpoint}.tsx

for example:
```
import { client } from "./gen/clients";

export const fetchEndpoint = client.path("/api/endpoint").method("get").create()
```




