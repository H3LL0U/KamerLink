# Kamerlink frontend
contains code for the site's frontend

## src/pages
Stores components that are later used as pages in App.tsx using react-router-dom.
The pages are stored in a hierarchical order where src/pages is the root.

So for example for the new page at the root of the site (www.domain.com/new_path) a file should be created a file with the page component at the path src/pages/new_path.tsx (home.tsx is an exception. It is used as the root)

For nested paths new directory/directories should be created that represent the nesting of the path: So (www.domain.com/path/new_path) should be stored in src/pages/path/new_path.tsx

### src/pages/REPLACEMENTS
This folder is not part of the routing.
Components stored within this directory are used to replace pages if they user does not meet certain requirements


## src/components
Used for storing components that are (re)used in the pages

### src/components/generic_components
Is used for storing components that are non-page-specific

### src/components/page_components
Is used for storing components that are page specific or are only used in some specific circumstaince

## src/api
Used for storing openapi functions that are later used to call the backend API from the frontend

- src/api/api.tsx is used for storing constants
- src/api/* is used for storing functions used for calling the api that are generated using the client constant (see bellow)

### src/api/gen
Stores the generated api (src/api/gen/api.ts) and the configuration of the "client" constant (src/api/gen/clients.ts) that is used for creating the api functions in src/api 

The api is being automatically generated from ./backend/openapi.json (see ./backend/README.MD for more information )
