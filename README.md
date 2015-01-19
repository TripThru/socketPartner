TripThru websocket gateway
=============

Setup on Linux

    apt-get install git
    apt-get install nodejs
    apt-get install npm
    apt-get install node-legacy
    npm install -g node-gyp
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    apt-get update
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
    apt-get update
    apt-get install -y mongodb-org

    cd ~/dev
    git clone https://github.com/TripThru/socketPartner.git
    cd socketPartner
    npm install
    npm install -g grunt

To run tests

    service mongod start
    service redis start
    cd socketPartner
    grunt 
    
