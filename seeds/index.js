// Type in node seeds/index.js to seed the database.  

// Require packages.  
const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');

// Require the models from models folder.  
const Thread = require('../models/thread');

// Connect to the database coding-gurus.  
mongoose.connect('mongodb://127.0.0.1:27017/coding-gurus', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection open!");
    })
    .catch(error => {
        console.log("Error!");
        console.log(error);
});

// Delete all existing Thread objects.  Add a new Thread object into the database.  Create 10 threads.   
const seedDB = async () => {
    await Thread.deleteMany({});
    for(let i = 0; i < 10; i++) {
        const t = new Thread({
            title: 'Thread',
            content: 'This is a comment.', 
            postTime: new Date(), 
            lastEditTime: new Date(),
            lastThreadUpdate: new Date()
        });
        await t.save();
    }
}

seedDB();