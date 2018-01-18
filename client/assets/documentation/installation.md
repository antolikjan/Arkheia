# Installation

We envision two main types of Arkheia deployment:

- **Local** : user utilizes Arkheia on a daily basis as a local store and exploration tool for her simulation results.
- **Public** : the Arkheia instance is used as a publishing platform for a user’s models and results (e.g. accompanying a publication)

Currently we offer two installation methods: [from source](#fs) and via the [Docker](#docker) container technology.
We recommend installation from source for the local deployment, and the docker installation method for the public use-case. 

## Installation from source
<a id="fs"></a>


### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Installation steps

1. Install the above prerequisites

2. Run `git clone https://github.com/antolikjan/Arkheia` in a directory you wish to hold the Arkheia installation

3. `cd Arkheia`

4. Run `npm install` to install server dependencies.

5. Run `bower install` to install client dependencies.

5. Run `sudo service mongod start` in a separate shell to keep an instance of the MongoDB Daemon running

6. Run `gulp serve` will start a local instance at localhost:3000. It should automatically open the client in your browser when ready.

7. New results can be added by pointing the given backend to the database running locally at localhost:27017.

## Docker installation
<a id="docker"></a>

To facilitate even simpler deployment, especially in the cloud, we also provide a [Docker image](https://hub.docker.com/r/antolikjan/arkheia/) of the latest stable version of the system, with accompanying [docker-compose specification](https://github.com/antolikjan/Arkheia/blob/master/docker-compose.yaml) which is configured for deploying the system on a server for public access. Assuming an installed docker service, user simply needs to download the docker-compose configuration file and issue the docker-compose command to start the Arkheia service.

### Use-case: DigitalOcean cloud service

1. Select the ['Docker droplet’](https://www.digitalocean.com/products/one-click-apps/docker/) in the DigitalOcean interface, 
2. Login to the running droplet (follow DigitalOcean instructions to do this)
3. Download the docker compose config file: `wget https://raw.githubusercontent.com/antolikjan/Arkheia/master/docker-compose.yaml`
4. Run `docker-compose up`
5. At this point Arkheia service is running and is publicly accessible online.