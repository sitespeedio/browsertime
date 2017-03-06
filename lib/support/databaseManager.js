#!/usr/bin/env node
'use strict';

const MongoClient = require('mongodb').MongoClient,
    Promise = require('bluebird'),
    moment = require('moment');

class DatabaseManager {
    constructor(options){
        this.website = options._[0];
        this.URI = options.mongo.URI;
        this.collection = options.mongo.collection || "browsertime";
    }

    connectToMongo(){
        var self = this;
        return new Promise(function(resolve, reject){
            MongoClient.connect(self.URI, function(err, db) {
                if(err){
                    reject(err);
                }
                else{
                    resolve(db);
                }
            });
        });
    }

    saveToMongo(har) {
        var self = this;
        return new Promise(function(resolve, reject){
            self.connectToMongo().then(function(db){
                var collection = db.collection(self.collection);
                let metadata = {
                    url: self.website,
                    date: moment().toISOString()
                };
                har.metadata = metadata;
                collection.insert(har);
                db.close();
                resolve();
                
            });
        });
    }
}

module.exports = DatabaseManager;
