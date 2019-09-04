[![Build Status](https://travis-ci.org/SPRINT-Project/simpatico-adaptation-engines.svg?branch=master)](https://travis-ci.org/SPRINT-Project/simpatico-adaptation-engines)

[![codecov](https://codecov.io/gh/SPRINT-Project/simpatico-adaptation-engines/branch/master/graph/badge.svg)](https://codecov.io/gh/SPRINT-Project/simpatico-adaptation-engines)

# TAE and WAE API projects


## Description


The project exposes the Text Adaptation Engine API and the Workflow Adaptation Engine Model Repository

## Requirements


The following should be installed in order to execute the engines:

    1. Java 8
    2. MongoDB 
    
## Installation without docker

### Configuration


The engine configuration relies on a series of configuration properties deriving from Spring Boot properties and
the specific engine properties. It is possible to pass the properties either as execution parameters (`-D<propertyname>=<propertyvalue>`) or defining them in the `src/main/resources/application.properties`. 
The following properties are relevant:

  - `server.port`: Defines the HTTP port where the engines will listen   
  - `server.contextPath`: the engine context path used for the exposed endpoint (simp-engines)
  - `spring.data.mongodb.uri`: URL of the MongoDB data base (e.g., `mongodb://localhost:27017/waedb`)
  - `tae.mode.proxy.enabled`: defines whether the instance works as a proxy to a remote Text Adaptation Engine API
  or implements the functionality internally. The TAE functionality is resource consuming; if the engine works 
  in test mode or does not require instantiating this functionality set this value to true.
  - `tae.mode.proxy.endpoint`: Endpoint of the remote TAE instance. Required in case of proxy mode is enabled.

### Build and run

The engine runtime is implemented as a Spring Boot standalone application and can be built with Apache Maven.
To accomplish this, execute (within the project directory)

<code>
./mvnw package
</code>      
       
This produces the executable jar in `target` folder. To execute the engine use the following command:

<code>
java -jar target/simpatico-adaptation-engines-0.0.1-SNAPSHOT.jar
</code>       
         
## Installation with docker

### Configuration

Configure properties in file `docker-configs/app.env`

### Build and run

From the root of the project: 

* Try the system executing `docker-compose up`
* Run as a daemon executing `docker-compose start`
* Stop the daemon executing `docker-compose stop`


## Documentation

The WAE workflow model and its usage is described [here](doc/wae-model.docx)

The API exposes the Swagger documentation at the following endpoints
  - `<context-path>/apidocs`: The raw swagger 2 API definition
  - `<context-path>/swagger-ui.html`: The Swagger UI interface of the component

To run the multi-language environment, you need to implement two steps:
- Install the [Simpatico TAE server](https://github.com/SIMPATICOProject/SimpaticoTAEServer) for lexical and syntactic simplification.
- Edit the configuration file and add the `lex.server` and `lex.port` settings in `src/main/resources/simpatico-default.props` so that they point to the correct information.

## Requirements

The TAE server needs the last version of [Tint](http://tint.fbk.eu/) and [FBK utils](https://github.com/fbk/utils) installed.

Run these commands:
```
git clone https://github.com/dhfbk/tint
cd tint
git checkout corenlp370
mvn clean install
cd ..
git clone https://github.com/fbk/utils
cd utils
git checkout develop
mvn clean install
```
