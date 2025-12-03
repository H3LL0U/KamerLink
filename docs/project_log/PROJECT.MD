# Project definition

The goal of the project is to create a valuable social media website/platform which can be used by students and teachers of Kamerlingh Onnes to share ideas/news and other school related content. 
The main question that needs to be answered is:

**What is needed to create a social media platform?**

Sub-questions that arose during the development
**What are essential components that compose a site**

**How can a website be hosted on a network that is not directly accessible from the internet?** 


# Planning and Methodology [^1]

For this project I used a mix of ideas from multiple software development methodologies. 

## Ideas from kanban methodology
I took the idea of the kanban board and used it to implement the features.

![Description](/docs/assets/img/kanban_bord.png)
<sub>Example of a kanban board</sub>

I defined no more than 5 issues at once and worked on them one by one to maintain focus on prioritized features.

## Sprint review (Agile Scrum)

On each meeting with the PWS mentor I got feedback on the added features and the progress as a whole. 
My goal before every meeting was to complete a selected set of backlog items so that I could gather feedback and ideas for the next iteration.
In practice this created a cycle of 1–2-week "sprints" during which I implemented several features before the next review session.

( examples of issues that I created based on feedback were: #18 and #14. Though, issue #18 wasn't created by a planned meeting )

## User stories

Most of the issues were formulated as user stories, which provided a clear description of the desired functionality and a concrete definition of when an issue could be considered complete and ready to be marked as Done.




# What could have been done better

There are a lot of things that could have been done better during the project. Firstly some of the core functionality is missing. For instance an ability to add images to user posts ( issue #11 ). Unfortunately, I chose to not implement it because it required a lot of resources which will increase operational costs. Additionally, it can be complex to implement based on the approach. To implement this feature there is either a need for an image storage provider or store them on the backend directly. Use of an image storage provider can be quite costly, though there are providers that can be perfect for the scale of this project for example Cloudflare R2 [^2] it is still increases complexity because of further reliance om external services. Storing images directly on the backend will not be viable long term because of the storage constraints on school grounds. It would have been a major user experience feature.
The other feature that could have been added is a caching layer between the database and the backend which would have improved performance for frequently accessed endpoints. Even though, it might be overkill for this project's scale it would still be nice to have.
The biggest improvement would have been early and extensive communication with the school. What I wanted to do after most of the core functionality was implemented is to advertise the project on school grounds (See marketing field in DECISIONS.MD). However, because I didn't communicate with the school administration early I couldn't advertise the product before the "Meesterwerk festival".


[^1] Agile Scrum Handboek – 3de druk Boek van Nader K. Rad
Trustworthy: was part of my software development studies by NHA 

[^2] https://www.cloudflare.com/nl-nl/lp/pg-cloudflare-r2-vs-aws-s3/
Official cloudflare website so it can be trusted


