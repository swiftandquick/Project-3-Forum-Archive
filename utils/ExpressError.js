// Create a subclass for Error, which inherits all Error class' properties and methods.   
class ExpressError extends Error {
    // Call the error constructor.  
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;