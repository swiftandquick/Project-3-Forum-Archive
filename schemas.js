const Joi = require('joi');

// Middleware function to validate schema.  
// Use joi to validate the schema, both title and content must be non-empty strings.  
module.exports.threadSchema = Joi.object({
        thread: Joi.object({
            title: Joi.string().required(), 
            content: Joi.string().required() 
        }).required()
    });

// Use joi to validate the schema, replyContent must not be an empty string.  
module.exports.replySchema = Joi.object({
    reply: Joi.object({
        replyContent: Joi.string().required()
    }).required()
});