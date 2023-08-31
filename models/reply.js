// Require packages.  
const mongoose = require('mongoose');

// Create a schema.  
const Schema = mongoose.Schema;

// Create a schema for replies, which include replyContent as string, 
// replypostTime as date, which indicates when the reply was made, 
// replyLastEditTime as date, which indicates when the reply was last edited. 
const replySchema = new Schema({
    replyContent: String,
    replyPostTime: Date, 
    replyLastEditTime: Date
});

module.exports = mongoose.model("Reply", replySchema);