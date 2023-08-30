// Require packages.  
const mongoose = require('mongoose');

// Require the reply schema.  
const Reply = require('./reply');

// Create a schema.  
const Schema = mongoose.Schema;

// Create a schema for threads, which include title and content as strings, 
// postTime as date, which indicates when the thread was made, 
// lastEditTime as date, which indicates when the thread was last edited, 
// lastThreadUpdate is also a date, which indicates the date of the last reply submitted, if there are no replies, lastThreadUpdate equals postTime, 
// replies is an array of Reply objects.  
const ThreadSchema = new Schema({
    title: String, 
    content: String, 
    postTime: Date, 
    lastEditTime: Date,
    lastThreadUpdate: Date, 
    replies: [{type: Schema.Types.ObjectId, ref: 'Reply'}]
});

// When the thread is deleted, delete all the replies that it contained as well.  
ThreadSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Reply.deleteMany({
            _id: {
                $in: doc.replies
            }
        })
    }
});

// Export to ThreadSchema.  
module.exports = mongoose.model('Thread', ThreadSchema);