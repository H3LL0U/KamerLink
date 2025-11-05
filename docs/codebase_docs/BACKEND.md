# Kamerlink backend
Contains code for the site's backend

## src/database
Contains mongodb specific schemas and utilities

### src/database/schemas
Stores schema's that are used for a specific API endpoint that are later used in src/routes/* for MongoDB document retrieval and change

These schema's are mostly collection specific structs and enums (that are used inside of said structs)

## src/routes
Stores functions that are used to represent a specific API endpoint. They are stored using a hierarchical order like ./frontend/src/pages (see ./frontend/README.MD)

### src/routes/mod.rs
Is used to setup the OpenAPI using utopia. After an endpoint function is created (and is promptly documented using utopia's macros) it should be added into paths.
It is important because the generated ./openapi.json is later used to generate frontend API functions

## src/validation
Stores the validation middleware that is used to check if a specific user is logged in correctly and is allowed to access an API. It is automatically applied for all of the API's (in main.rs)

