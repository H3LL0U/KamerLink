# Decisions made when constructing the project

## User base

The users of the websites are teachers and students of Kamerlingh Onnes. (Anyone that has a o2g2 email)

## Scale

The project has a limited scale since it is meant to be used by users from a singular school which is a maximum of around 2000 people. The website's endpoints do not perform any complex operations (mostly database queries). For that reason I've chosen to not outsource the computational power to other providers (the backend) to minimize operational costs. Also, for the same reason, there is only a singular server, which in my expectation should be able to handle the load.

## Architecture

### First iteration

The first iteration of the architecture looked as demonstrated bellow

![Description](/docs/assets/img/architecture1.png)

#### Four main components (1st iteration)

- Authentication
Uses Auth0 for authentication. I chose to use it because of it's easy integration with typescript and because it's free tier allows 25,000 monthly active users which more than enough for the scale. [^1]

- Frontend
Is hosted on vercel since it's free tier allows 1,000,000 requests per month.[^2] Which should be enough for the scale. I've chosen for this option because I had prior experience with the platform.

- Backend
Is hosted on render.com. It has an easy integration with github which allowed the deployment of the backend to be done with ease.[^3]
I've chosen for this option for the same reason as for the frontend.

- Database
MongoDB database was hosted on mongoDB servers. On free tier it allowed me to have the database size of under 512MB which should be more than enough for the scale. I've chosen for this option because MongoDB free tier is quite generous when it comes to small scale projects which is perfect for this use case. It also makes sure that the operational costs are kept low.[^4]


#### Problem with this approach

The main problem comes from the backend hosting. The free tier doesn't run continuously. So when the user tries to access the backend endpoints the server might not be active and the user needs to wait until it spins up again. This will cause major user inconvenience when using the website. This introduces a bottleneck

To rectify the problem a new iteration of the architecture was implemented.


### Second iteration

#### Changes
In the second iteration the backend hosting was changed to local hosting

#### Problems with this approach
In order to allow users all across the internet to interact with the backend IP-forwarding was enabled. There are a couple of disadvantages that come with this.

1. The IP-address on of the network which hosts the backend is exposed which makes the service and network susceptible to DDOS attacks.
2. If the service is to be maintained for the future it is a requirement that it runs on school grounds. For security reasons the school does not allow port forwarding to be enabled.


To counteract these problems the third iteration of the architecture was created.

### Third Iteration (current iteration)

Third iteration is demonstrated bellow

![Description](/docs/assets/img/architecture_diagram.png)

#### Changes
Instead of using port forwarding the service now uses cloudflare tunnels which protects the network from DDOS attacks and does't expose the IP-address.[^4]
This also allows the school to use it since the only requirement for service to work is to have network connection (so there is no need for port forwarding).

The service can now be hosted interchangeably either from school (using Hyper-V) or from my home network.

## Codebase

### Frontend
I have chosen to use Typescript and React (Vite) because I had prior experience creating pages with those language and framework.

### Backend
I had two candidates to choose from when choosing the language and framework to build the backend with:

- Python (Flask)
- Rust (Axum)

I had prior experience with both languages, with more extensive backend development experience in Python than in Rust. I chose Rust for the following reasons:

1. Since rust is a compiled language with no "garbage collection", it is more performant compared to Python [^5]. Even though the performance shouldn't be a big concern for the project of this scale, I though it might still be useful since i had little experience handling real user traffic.

2. I was curious how viable Rust was for this use case and wanted to learn something new (since I had no prior experience in creating a backend in rust).


[^1]: https://community.vercel.com/t/visit-limits-on-a-static-website/1346
[^2]: https://dashboard.render.com/
[^3]: https://www.mongodb.com/pricing
[^4]: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/
[^5]: https://pullflow.com/blog/go-vs-python-vs-rust-complete-performance-comparison