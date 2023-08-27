// Require packages.  
const mongoose = require('mongoose');

// Create a schema.  
const Schema = mongoose.Schema;

// Create a schema for threads, which include title and content as strings, 
// postDate as date, which indicates when the thread was made, 
// lastEditDate as date, which indicates when the thread was last edited, 
// lastThreadUpdate is also a date, which indicates the date of the last reply submitted, if there are no replies, lastThreadUpdate equals postTime.   
const ThreadSchema = new Schema({
    title: String, 
    content: String, 
    postTime: Date, 
    lastEditTime: Date,
    lastThreadUpdate: Date
});

// Export to ThreadSchema.  
module.exports = mongoose.model('Thread', ThreadSchema);