// func is what I pass in, execute func any errors and pass into next.  
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}