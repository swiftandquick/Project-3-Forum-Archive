// Require packages.  
const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// Require the models from models folder.  
const Thread = require('./models/thread');

// Connect to the database coding-gurus.  
mongoose.connect('mongodb://127.0.0.1:27017/coding-gurus', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection open!");
    })
    .catch(error => {
        console.log("Error!");
        console.log(error);
});

// Use ejs-mate on ejs files.  
app.engine('ejs', ejsMate);

// Set the view engine to ejs, so we use ejs files for front end layout instead of html files.  
app.set('view engine', 'ejs');

// __dirname is the current directory of app.js, if I use the join method, I set views directory to the views folder regardless of where I am currently at.  
app.set('views', path.join(__dirname, 'views'));

// Use this line of code so I can link the the bootstrap styling to boilerplate.ejs.  
app.use(express.static(path.join(__dirname, 'public')));

// This line of code allows me to parse req.body.  
app.use(express.urlencoded({ extended: true }));

// The query string for overriding methods is "_method".  
app.use(methodOverride('_method'));

// Home page, localhost:3000.  
// Render the home.ejs view when I a on the main page.  
app.get('/', (req, res) => {
    res.render('home');
});

// Index page, localhost:3000/threads.  
// Find all campgrounds and render them in index.ejs of threads folder, pass in threads array as argument.  
// Sort the threads array by time from latest to earliest before passing threads into index.ejs.  
app.get('/threads', async (req, res) => {
    const threads = await Thread.find({});
    threads.sort(function(a, b) {
        return b.lastThreadUpdate.getTime() - a.lastThreadUpdate.getTime();
    });
    res.render('threads/index', {threads});
});

// Create a thread, localhost:3000/threads:new.  
// When creating a thread, render new.ejs of threads folder.  
app.get('/threads/new', (req, res) => {
    res.render('threads/new');
});

// When the form from localhost:3000/threads/new is submitted, this will post method be invoked.  
// Set the postTime, lastEditTime, and lastThreadUpdate to current time, which is the time when the thread is submitted. 
// Save the thread as the new object inside the threads table.  
// Redirect to the newly created thread.  
app.post('/threads', async(req, res) => {
    const thread = new Thread(req.body.thread);
    thread.postTime = new Date();
    thread.lastEditTime = new Date();
    thread.lastThreadUpdate = new Date();
    await thread.save();
    res.redirect(`/threads/${thread._id}`);
});

// Individual thread, localhost:3000/threads/:id.  :id is the thread's ID.  
// For example, the link can be http://localhost:3000/threads/64e3fc4984cd83ab455ca60c.  
// Render a specific thread based on ID, on show.ejs of threads folder.  
app.get('/threads/:id', async(req, res) => {
    const thread = await Thread.findById(req.params.id);
    res.render('threads/show', { thread });
});

// Edit the thread, localhost:3000/threads/:id/edit.  :id is the thread's ID.  
// Find the thread by the ID.  
// Pass the thread object into edit.ejs of threads folder.  
app.get('/threads/:id/edit', async(req, res) => {
    const thread = await Thread.findById(req.params.id);
    res.render('threads/edit', { thread });
});

// When the edit form is submitted on localhost:3000/threads/:id/edit, this PUT method is invoked.  
// Set the thread's lastEditTime to now.  
// After the edit thread form is submitted, redirect to localhost:3000/threads/:id.  
app.put('/threads/:id', async(req, res) => {
    const { id } = req.params;
    const thread = await Thread.findByIdAndUpdate(id, {...req.body.thread});
    thread.lastEditTime = new Date();
    await thread.save()
    res.redirect(`/threads/${thread._id}`);
});

// When the delete form is submitted on localhost:3000/threads/:id, this DELETE method is invoked.  
// Delete the thread from the database.  
// Redirect to localhost:3000/threads after deletion.  
app.delete('/threads/:id', async (req, res) => {
    const { id } = req.params;
    await Thread.findByIdAndDelete(id);
    res.redirect('/threads');
})

// The local app will be listened on port 3000.  The address on the server should be http://localhost:3000/.  
app.listen(3000, () => {
    console.log("Serving on port 3000...");
});