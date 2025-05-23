The digital experience platform v3 consists of the following architectural components:
A delivery and a management application:

The delivery application consists of:
- dxp3-delivery-gateway: a gateway and load balancer.
- dxp3-delivery-ui     : a front end that renders the application user interface
- dxp3-delivery-api    : a back end that provides all the necessary content
- dxp3-delivery-dao    : a database/storage layer

- nginx reverse proxy to get requests to the proper destination and to inject authentication and authorization functionality
- redis cache layer
- several nodejs api's for CRUD actions on different resources:
	- application
	- page
	- feature
	- domain

There are two ways you can run the solution on your local machine:
1) Using individual services
2) Using docker-compose

INDIVIDUAL SERVICES
1) NGINX
/dxp3/delivery/nginx-1.10.1
the nginx.conf file has references to all the back end services.
To start nginx open a command prompt (CMD) go to the nginx directory and type 'nginx'.
The webserver is configured to listen on port 8081.

2) REDIS
docker run -p 6379:6379 redis

3) API APPLICATION, CONTENT, DOMAIN, FEATURE and PAGE
/dxp3/delivery/api
node app.js -loglevel trace


You can build the application api docker image:
docker build -f docker-file-delivery-api-application .

To start the delivery platform you can use docker compose.
docker-compose -f docker-compose-delivery.yml up

To stop all containers
docker-compose -f docker-compose-delivery.yml down

To remove all containers
docker-compose -f docker-compose-delivery.yml rm

To remove all images used by docker compose:
docker-compose -f docker-compose-delivery.yml down --rmi all

GENERIC DOCKER COMMANDS:

To remove all containers
docker rm $(docker ps -a -q)

To remove all images
docker rmi $(docker images -a -q)

2) A management platform

Startup:
Open your docker terminal/CLI
cd <dxp3 delivery path. Probably the same place this readme.txt lives>
docker-compose up