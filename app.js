// Require packages.  
const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override');

// Require files in utils folder.  
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// Require functions on schemas.js.  
const { threadSchema, replySchema } = require("./schemas.js");

// Require the models from models folder.  
const Thread = require('./models/thread');
const Reply = require('./models/reply');

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

// Middleware function to validate threadSchema.  
const validateThread = (req, res, next) => {
    const { error } = threadSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// Middleware function to validate threadReply.  
const validateReply = (req, res, next) => {
    const { error } = replySchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// Home page, localhost:3000.  
// Render the home.ejs view when I a on the main page.  
app.get('/', (req, res) => {
    res.render('home');
});

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// Index page, localhost:3000/threads.  
// Find all campgrounds and render them in index.ejs of threads folder, pass in threads array as argument.  
// Sort the threads array by time from latest to earliest before passing threads into index.ejs.  
app.get('/threads', catchAsync(async(req, res) => {
    const threads = await Thread.find({});
    threads.sort(function(a, b) {
        return b.lastThreadUpdate.getTime() - a.lastThreadUpdate.getTime();
    });
    res.render('threads/index', {threads});
}));

// Create a thread, localhost:3000/threads/new.  
// When creating a thread, render new.ejs of threads folder.  
app.get('/threads/new', (req, res) => {
    res.render('threads/new');
});

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// validateThread is a middleware function that validates the thread schema.  
// When the form from localhost:3000/threads/new is submitted, this will post method be invoked.  
// Set the postTime, lastEditTime, and lastThreadUpdate to current time, which is the time when the thread is submitted. 
// Save the thread as the new object inside the threads table.  
// Redirect to the newly created thread.  
app.post('/threads', validateThread, catchAsync(async(req, res) => {
    const thread = new Thread(req.body.thread);
    thread.postTime = new Date();
    thread.lastEditTime = new Date();
    thread.lastThreadUpdate = new Date();
    await thread.save();
    res.redirect(`/threads/${thread._id}`);
}));

// Individual thread, localhost:3000/threads/:id.  :id is the thread's ID.  
// For example, the link can be http://localhost:3000/threads/64e3fc4984cd83ab455ca60c.  
// Populate the replies array of objects so we can display the property replyContent for each reply object.  
// Render a specific thread based on ID, on show.ejs of threads folder.  
app.get('/threads/:id', catchAsync(async(req, res) => {
    const thread = await Thread.findById(req.params.id).populate('replies');
    res.render('threads/show', { thread });
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// Edit the thread, localhost:3000/threads/:id/edit.  :id is the thread's ID.  
// Find the thread by the ID.  
// Pass the thread object into edit.ejs of threads folder.  
app.get('/threads/:id/edit', catchAsync(async(req, res) => {
    const thread = await Thread.findById(req.params.id);
    res.render('threads/edit', { thread });
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// validateThread is a middleware function that validates the thread schema.  
// When the edit form is submitted on localhost:3000/threads/:id/edit, this PUT method is invoked.  
// Set the thread's lastEditTime to now.  
// After the edit thread form is submitted, redirect to localhost:3000/threads/:id.  
app.put('/threads/:id', validateThread, catchAsync(async(req, res) => {
    const { id } = req.params;
    const thread = await Thread.findByIdAndUpdate(id, {...req.body.thread});
    thread.lastEditTime = new Date();
    await thread.save()
    res.redirect(`/threads/${thread._id}`);
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// When the delete form is submitted on localhost:3000/threads/:id, this DELETE method is invoked.  
// Delete the thread from the database.  
// Redirect to localhost:3000/threads after deletion.  
app.delete('/threads/:id', async (req, res) => {
    const { id } = req.params;
    await Thread.findByIdAndDelete(id);
    res.redirect('/threads');
});

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// validateReply is a middleware function that validates the thread schema.  
// When a form is submitted on localhost:3000/threads/:id, a post request is sent to localhost:3000/threads/:id/replies.  
// Set the replyPostTime, replyLastEditTime for reply as well as lastThreadUpdate for thread to current time, which is the time when the thread is submitted. 
// Retrieve the information from the submitted form to create a reply object, then add the reply object to the current thread's replies array property.  
// Redirect to the show page of the current thread at localhost:3000/threads/:id.  
app.post('/threads/:id/replies', validateReply, catchAsync(async(req, res) => {
    const thread = await Thread.findById(req.params.id);
    const reply = new Reply(req.body.reply);
    reply.replyPostTime = new Date();
    reply.replyLastEditTime = new Date();
    thread.lastThreadUpdate = new Date();
    thread.replies.push(reply);
    await reply.save();
    await thread.save();
    res.redirect(`/threads/${thread._id}`)
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// Edit the reply, localhost:3000/threads/:id/replies/:replyId/edit.  :id is the thread's ID, :replyId is reply's ID.  
// Find the thread and reply by the ID.  
// Pass the thread and reply object into editReply.ejs of threads folder.  
app.get('/threads/:id/replies/:replyId/edit', catchAsync(async(req, res) => {
    const thread = await Reply.findById(req.params.id);
    const reply = await Reply.findById(req.params.replyId);
    res.render('threads/editReply', { thread, reply });
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// validateReply is a middleware function that validates the thread schema.  
// If I submit the form on localhost:3000/threads/:id/replies/:replyId/edit, 
// a put request will be sent to localhost:3000/threads/:id/replies/:replyId.  
// The object with the corresponding reviewId will be removed from the current thread's replies array property.  
// The reply itself will be updated, then rejoin the replies array of the current thread.  
// Redirect to localhost:3000/threads/:id after a form is submitted.  
app.put('/threads/:id/replies/:replyId', validateReply, catchAsync(async(req, res) => {
    const { id, replyId } = req.params;
    const thread = await Thread.findByIdAndUpdate(id, { $pull: { replies: replyId }});
    const reply = await Reply.findByIdAndUpdate(replyId, {...req.body.thread});
    reply.replyLastEditTime = new Date();
    thread.replies.push(reply);
    await reply.save();
    await thread.save();
    res.redirect(`/threads/${id}`)
}));

// If there's an error, catchAsync will catch the error and the use method will be invoked.  
// If I delete a reply by clicking on the small delete button on localhost:3000/threads/:id, 
// a delete request will be sent to localhost:3000/threads/:id/replies/:replyId.  
// The object with the corresponding reviewId will be removed from the current thread's replies array property.  
// The reply itself will also be removed from the database.  
// Redirect to localhost:3000/threads/:id after a form is submitted.  
app.delete('/threads/:id/replies/:replyId', catchAsync(async(req, res) => {
    const { id, replyId } = req.params;
    await Thread.findByIdAndUpdate(id, { $pull: { replies: replyId }});
    await Reply.findByIdAndDelete(replyId);
    res.redirect(`/threads/${id}`)
}));

// Order is important.  This will only run if nothing else is match first.  
// If I go to localhost:3000/naruto, I will get an error message because the page doesn't exist.  
// The use method to render error will be invoked if I go to a non-existent page, error message is "Page not found!", statusCode is 404.  
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!', 404));
});

// Handle errors, such as go to a page that doesn't exist or open a thread with the wrong id.  
// Render the error on error.ejs.  
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong!";
    } 
    res.status(statusCode).render('error', { err });
});

// The local app will be listened on port 3000.  The address on the server should be http://localhost:3000/.  
app.listen(3000, () => {
    console.log("Serving on port 3000...");
});