# Arkheia

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 4.2.2.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`sudo npm install -g gulp@3.9.0`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`
- [Python 2.7](https://www.python.org/download/releases/2.7/) With the following package installed: 
>	* numpy 
>	* pymongo 
>	* gridfs 
>	* sphinx 
>	* pynn 
>	* parameters 
>	* re 
>	* sys 
>	* os 
>	* datetime 
>	* json 
>	* pickle 
>	* imageio==2.6
>	* mozaik (https://github.com/CSNG-MFF/mozaik/)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `sudo npm install -g bower` to install bower and then run `bower install -f angular-ui-tree angular-bootstrap-lightbox angularjs-slider --config.directory=client/bower_components` to install these bower components in the proper directory.

3. Run `sudo mkdir -p /data/db/` and ``sudo chown `id -u` /data/db`` to create the MongoDB directory with user ownership and then `mongod` in a separate shell to keep an instance of the MongoDB Daemon running.

4. Run  `sudo npm install --global gulp@3.9.0` to install gulp and `npm link gulp` to link it locally. Then run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

5. Use the script add_mozaik_repository.py in the server directory to add mozaik simulations (`python add_mozaik_repository.py path_to_mozaik_simulation_run_output_directory`) or mozaik parameter search (`python add_mozaik_repository.py path_to_mozaik_parameter_search_output_directory name_of_the_simulation`) in the mozaik repository.

## Build & development

Run `gulp build` for building and `gulp serve` for preview.
