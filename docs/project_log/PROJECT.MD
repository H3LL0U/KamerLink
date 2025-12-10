# Project definition

The goal of the project is to create a valuable social media website/platform which can be used by students and teachers of Kamerlingh Onnes to share ideas/news and other school related content without introducing high operational costs.

The main question that needs to be answered is:
**What technical and architectural components are required to design and maintain a modern social media platform?**

Sub-questions that arose during the development

**What mechanisms enable externally accessible web services to operate from within private or restricted networks?** 

and

**What authentication models are used to securely verify user identities in web applications?**


# Answering the sub-questions

## What mechanisms enable externally accessible web services to operate from within private or restricted networks?

There are several mechanisms that make a website accessible to the users that are connected to the internet. But not all of them are viable on a restrictive network.
Here I will describe 4 of them: Port forwarding, reverse proxies, remote access VPNs, and Tunneling technologies.

### Port forwarding/mapping
Port forwarding (or mapping) is one of the most direct methods for making a device on a private network accessible from the internet. In this approach, the network’s gateway most of the time a router is configured to "listen" for incoming requests on a specific external port. When such a request arrives, the gateway forwards it to the corresponding internal device and port on the private network, allowing external clients to reach a service that is otherwise not publicly accessible.


![Description](/docs/assets/img/napt_diagram.png)
<sub>A diagram showing how the requests are being routed using a NAPT-table [^3]</sub> 

Initially in this project it was configured in my router settings:
![Description](/docs/assets/img/example_kpn_portforwarding.png)

But it was later changed to a different method.
Because of how direct port forwarding is, it brings a lot of disadvantages. This method would probably not allowed to be used on a restricted network. ( for more information see Architecture in DECISIONS.MD).


### Reverse proxy

A reverse proxy is a server that sits between the host machine (In this case the one that hosts the website) and the end user. 

A reverse proxy intercepts the requests that the client sends and either sends it to one of the available servers (load balancing), sends the response back on behalf of the server (caching), reject the request (Cyber attack protection) or transform the request and send it to one of the available servers (for example header insertion and ssl encryption).

![Description](/docs/assets/img/example_kpn_portforwarding.png)
<sub>Example of a reverse proxy implementation. [^4]</sub> 

Unfortunately, to implement a reverse proxy the access to port forwarding is still required (to route the request to the reverse proxy). Because modification of network configuration cannot be allowed in a restrictive network this method is not viable. 

### Access through a remote access VPN

A remote access VPN server works by allowing user to connect to it and essentially making the user appear as if he is in the same private network (because the user now possesses the IP-address of the remote VPN server). When The user is connected to a VPN he can thus access resources that are only available on that private network. Most of the time the connection between the user and the VPN is also encrypted.

![Description](/docs/assets/img/remote_access_vpn.png) 

<sub>Example of where a user is accessing a private network by connecting to a VPN server [^5]</sub> 

This is not viable for the following reasons:
1. It requires that a user connects to a VPN-server to access the site. Which requires that a user has a vpn application installed. This makes the threshold to entry high (because of which not a lot of people are going to want to use the site)
2. The implementation of the VPN-server increases complexity of the architecture
3. The restrictions on the private network will not allow users to connect to the VPN-server

### Tunneling technologies (cloudflare tunnel)

A tunnel works by first establishing a connection between the server on which the site is hosted (host machine) and the cloudflare Edge server with an outbound connection (a websocket using HTTPS protocol which is not blocked on networks that have access to the internet). When a user sends a request to the cloudflare Edge server it sends the request to the host server through a "tunnel" that was established before. The "cloudflared" daemon (that was used to establish the connection in the first place) then forwards the user requests to the local endpoint on the host machine. The response from the host-machine then gets sent back through the tunnel and back to the user.

![Description](/docs/assets/img/cloudflare_tunnel.webp)
<sub>Diagram showing the workings of a cloudflare tunnel [^6]</sub>

Because there is no need to configure the network (gateway) in any way and the only requirement is that the network has an outbound connection to the internet this is a perfect way to make a site accessible on the internet on a restrictive network.

### Conclusion
Methods such as port forwarding reverse proxy and VPN allow direct access to the web service hosted on the private network, but because they all require some sort of network configuration they are not viable to be used in a restrictive network. The best mechanism to use in the case of a restrictive private network looks to be a tunnel.

## What authentication models are used to securely verify user identities in web applications?

There are numerous ways on how a site can implement authentication. Here I will review two models that are the most common:
1. Session based Authentication (Server stored)
2. Token based authentication (Stateless JWT)


### Session based Authentication

If a site uses session based authentication a user first sends their credentials to the authentication server. The server then verifies that the credentials are correct by comparing them in the database. The credentials in the database are most of the time not stored in plain text and are salted and hashed for security purposes. If credentials are correct the server then sends a session ID back to the user which is most of the time a unique string (which can be viewed as a limited time password). Also the server then stores that session internally. After the user has received their SessionID the browser stores it as a cookie. That cookie is will then be sent in subsequent requests. With that cookie the server can then identify the user and authorize some specific tasks.

![Description](/docs/assets/img/cookie-basic-example.png)
<sub>Basic example of session authentication [^7]</sub>

This has a couple of drawbacks. Mainly that the session needs to be stored on the backend which takes up extra resources.

### Token based Authentication (JWT) [^9]

Token based authentication works similarly to session based authentication, but instead of storing the session information on the server it stores it on the client. One of the most established standards is a JWT (JSON web token). This standard is being used by a lot of authentication providers including the one that I ended up using (Auth0). When user logs in and their credentials are validated the server sends back a JWT. JWT consists out of the following:
```
{header}.{payload}.{signature}
```
each of these parts is separated by a dot and encoded using Base64URL encryption


#### Header

The header field contains generic information about the token which is typically the algorithm used to sign the token (see signature explanation bellow) and the type of the token. 

```
{
  "alg": "HS256",
  "typ": "JWT"
}
```
<sub>Example of a header</sub>


#### Payload
Contains information about the session, user and the expiration time of the token. Can also contain any relevant field that is relevant to the session.

```
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```
<sub>Example of a payload</sub>


#### Signature
This field contains a signature that is derived from an algorithm used for encryption and a private key. There are different types of algorithms that can be used to obtain the signature. If the algorithm is asymmetric it has the following properties 

1. There is a public and a private key
2. The private key is used to generate a signature (most of the time by the hash of the header and the payload)
3. By using the public key the data can be verified

Because of these properties of the algorithm the signature can be verified by applying a public key which is most of the time accessible on some predefined endpoint (most of the time at /.well-known/jwks.json). So it can also be validated by others.

If a symmetric algorithm is used it has the following properties:
1. There is only one secret key
2. It can be used to generate and verify the signature
3. Signature cannot be verified without a key
Because there is no public key only the server (which has the private key) can validate the data. [^8]



### Outsourcing
Before the site chooses to implement authentication a question should be asked: Should authentication be outsourced?

There are pro's and cons to this.

#### Pros
1. The complexity of the project decreases dramatically because there is no need to implement additional architecture (for example email servers to send validation emails). Additionally there is no need to implement additional authentication logic.
2. There are pre-made libraries and documentation available. Which makes implementation of authentication even easier

#### Cons
1. The operational costs might be higher because of the additional fees from the authentication provider
2. Some changes which might improve efficiency might not be easily made because of the layer of abstraction created by the authentication provider
3. There are additional risks concerning security because there is a need to store user credentials

At the end I chose to outsource the authentication to Auth0 (See architecture field in DECISIONS.MD)

### Conclusion 
Authentication on a site can be implemented using numerous ways. Most of them fall in a category of Server stored and stateless. Each of these approaches has its advantages and disadvantages. Server stored sessions are a lot easier to implement, but requires extra resources compared to token-based approach. There is also a question of whether authentication should be outsourced to an authentication provider. In summary, choosing the best method depends on your project needs and scale.

# Answering the main question

## What technical and architectural components are required to design and maintain a modern social media platform?

### Architectural components [^11]

A typical architecture of a web service (which is applicable for a social media platform) can be divided into several components:

#### Presentation layer (frontend)
This layer makes the service accessible to the user (for example by using a browser). This layer is what user sees directly when accessing the service. UI elements and other components are accessible to the user through this layer. This layer is also used to make the user communicate with the business layer by for example making a user send a request when certain action is done by them.

##### Technical implementation
This layer can be implemented very differently based on the requirements of the project. For example it can either use server-side rendering (SSR) or client-side rendering (CSR). When SSR is used each page is being fetched separately only when the user needs it and the content is being generated on the server first before being sent to the user. When CSR is used the initial bundle is loaded that is then used to build the pages that the user visits. So the server does not need to (in other words the page is being built by the client). CSR can be practical if the site's users switch between pages a lot because the load time for pages is practically instant after the first fetch. 

#### Business layer (backend)
This layer's purpose is to accept and process the request sent by the user. For example: a valid user sends a request to the business layer to retrieve some user information. This request gets processed by querying the data persistence for the user data. After the data from the data persistence layer is retrieved it gets sent to the user in some format as a response. And so the user can communicate with the service.

##### Technical implementation

There are a lot of different ways that a business layer can be implemented. For example it can be a singular server which receives all of the requests. However, this might not be practical if a service is having a lot of users (a singular server might not be enough to handle the load). Another way to implement this layer is by using a load balancer which spreads the requests evenly across the servers. Business layer can also consist out of microservices. Microservices are mini-servers that are responsible for executing a specific task. The API then makes sure that each microservice only receives requests for their task. This layer can also be outsourced (serverless architecture).

#### Data persistence layer (Database and object storage)

This layer actually stores the data that is needed for the service to function (such as user data from the previous example). It can only (most of the time) be accessed by the business layer in order to ensure that the data is only accessible to the users that have authority to access the data.

##### Technical implementation
When implementing the Data persistence layer it is important to take into consideration the aspect of scaling. Sometimes only a singular database is needed to store all operational data. However, sometimes one server is not enough. There are different approaches to this they all fall into the category of vertical and horizontal scaling (this concept is also applicable to other layers). Vertical scaling means making the existing servers more powerful, for example by upgrading the hardware. Horizontal scaling means adding more servers to spread the load across multiple servers. There are different approaches to horizontal scaling. [^12]

###### Sharding
Sharding works by assigning some value, called a shard key, to a piece of data (in the case of MongoDB a document). This shard key is then used to assign some server to store that data. The data is then spread across multiple servers (shards). [^13]

###### Replication
Replication works by first assigning a primary database. From this database replicas are created which contain a copy of the data from the primary database. They are updated dynamically as the primary database updates. The data can then be read from the replicas which reduces load to the primary database. The write operations are still only received by the primary database so this technique is mostly used for read heavy applications. If write operations need horizontal scaling the master-master (multi-master) replication can be used. In this system there are multiple primary databases that can accept write operations. [^14]


#### Cross-cutting concerns and third party integrations

Cross-cutting code is used to handle non-functional requirements of the site (cross-cutting concerns). It is not confined to a singular part of the architecture, but is spread across of them. It is applicable to a verity of tasks such as: logging, monitoring, caching and a lot more. It can improve site's performance (for example by caching) or act as additional security measures. [^10]

Third party integrations are processes that are outsourced to some other party which is not your company. For example Auth0's services can be used to implement authentication without needing to do it from scratch for your own service.

### Conclusion
The main three most important technical and architectural components of a social media platform are: presentation layer, business layer and data persistence layer. Presentation layer is used to make the user able to interact with the site. The business layer is used to accept and process the user request and communicate with the data persistence layer. The data persistence layer is used to store data needed for the social media operations (such as user data and media). 

# What could have been done better


## Missing features
There are a lot of things that could have been done better during the project. Firstly some of the core functionality is missing. For instance an ability to add images to user posts ( issue #11 ). Unfortunately, I chose to not implement it because it required a lot of resources which might increase operational costs. Additionally, it can be complex to implement based on the approach. To implement this feature there is either a need for an image storage provider or store them on the backend directly. Use of an image storage provider can be quite costly, though there are providers that can be perfect for the scale of this project for example Cloudflare R2 it is still increases complexity because of further reliance om external services. [^1] Storing images directly on the backend will not be viable long term because of the storage constraints on school grounds. It would have been a major user experience feature.
The other feature that could have been added to the project's architecture is a caching layer between the database and the backend which would have improved performance for frequently accessed endpoints. Even though, it might be an overkill for this project's scale it would still be nice to have.


![Description](/docs/assets/img/Cache-Working.jpg)
<sub>Example of architecture where a caching layer is applied</sub> [^2]

## Communication
The biggest improvement would have been an early and extensive communication with the school administration. What I wanted to do after most of the core functionality was implemented is to advertise the project on school grounds as early as possible (See marketing field in DECISIONS.MD). However, because I didn't communicate with the school administration early enough I couldn't advertise the product before the "Meesterwerk festival".

## Lack of automated testing
Each endpoint was tested manually instead of creating unit tests or integration tests for each endpoint. This is not optimal because it might lead to unexpected bugs in the future and will make it harder to maintain. Adding these tests would have been a big improvement to the codebase.



[^1]: https://www.cloudflare.com/nl-nl/lp/pg-cloudflare-r2-vs-aws-s3/
Official cloudflare website so it can be trusted

[^2]: https://www.geeksforgeeks.org/system-design/caching-system-design-concept-for-beginners/
Trustworthy and established educational site that focuses on software engineering. So the example can be trusted.

[^3]: https://help.ubuntu.com/community/SSH/OpenSSH/PortForwarding
Trustworthy official site of ubuntu. 

[^4]: https://www.cloudflare.com/nl-nl/learning/cdn/glossary/reverse-proxy/
Trustworthy resource because cloudflare is a company that focuses on development in networking technologies and has a good reputation.

[^5]: https://www.researchgate.net/publication/256843676_A_New_Virtual_Private_Networks_Access_Model 
Yakova, Zornitsa. (2013). A New Virtual Private Networks Access Model. 
Trustworthy the paper that used this example contains a lot of references and the source is used for general explanation.

[^6]: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/
Trustworthy official site of cloudflare which offers cloudflare tunnels as a service

[^7]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
Trustworthy official website of mozilla which is an established organization in the field of web, open-source and browser development.

[^8]: https://auth0.com/docs/get-started/applications/signing-algorithms
Trustworthy site of the Authentication provider that I used for this project.

[^9]: https://www.jwt.io/introduction#what-is-json-web-token-structure
An established website that focuses on JWT debugging which is endorsed by Auth0, an established authentication provider, (which I also used in this project) so it can be trusted

[^10]: https://www.geeksforgeeks.org/system-design/cross-cutting-concerns-in-distributed-system/
Trustworthy and established educational site that focuses on software engineering. So it can be trusted

[^11]: https://www.spaceotechnologies.com/blog/web-application-architecture/
Even though it is a blog it was created by a person with more than 15 years of experience in the field. So it can be trusted

[^12]: https://www.geeksforgeeks.org/system-design/system-design-horizontal-and-vertical-scaling/
Trustworthy and established educational site that focuses on software engineering. So it can be trusted

[^13]: https://www.mongodb.com/docs/manual/sharding/
Trustworthy official docs of mongoDB. This database uses sharding as scaling strategy

[^14]: https://www.geeksforgeeks.org/system-design/database-replication-and-their-types-in-system-design/
Trustworthy and established educational site that focuses on software engineering. So it can be trusted