# What's In My Fridge
## Web Project 2016 (IG3 Polytech Montpellier)
Made with :heart: by **AFONSO Benjamin**


This is a web application based on an AngularJS Client, a NodeJS API and a PostgreSQL Database. This application helps you tracking what you have left in your fridge. Check report for more infos ;)

***To run, modify the database config file ( *Server/config/database.js* )***

### Installation
Of course, NPM has to be installed locally on your machine.

Then make sure you fulfill the following dependencies:
```
$ npm install -g grunt-cli
$ npm install -g bower
$ npm install -g bower-installer
```
Then run (For NodeJS API Server):
```
$ cd Server
```
```
$ npm install
```
And (For Angular Client):
```
$ cd ../ngClient
```
```
$ npm install
$ bower install
$ bower-installer
```


The Database init script is available on this repository. For more info, check the report.

### Running

Just run two instances of Terminal and then:

#### NodeJS Backend Server
Jump into Server directory first. <br>

Then just run
```
$ npm start
```
You should be able to visit the API by visiting http://localhost:3000/

#### Angular Client

For watch-tasks and dev-ends purposes, run
```
$ grunt
```
or
```
$ grunt deploy
```
for server only

The web application should be visible from http://localhost:8080


<hr>

If you have any issue, please submit an Issue. :octopus:
