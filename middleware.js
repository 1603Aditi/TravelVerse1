const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");  //server side mai model ko vslidate krne ke liye us kr re h

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        //redirect url
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","Login before you create a listing :)")
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    currUser=res.locals.currUser;
    if(!listing.owner._id.equals(currUser._id)){
        req.flash("error","You are not the owner:(");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing=(res,req,next)=>{     //passing as a middleware
    let result= listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }else{
        next();
    }
};


module.exports.validateReview=(req,res,next)=>{
    let result= reviewSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }else{
        next();
    }
};

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    currUser=res.locals.currUser;
    if(!currUser){
         req.flash("error","Please Login:(");
         return res.redirect("/login");
    }
    if(!review.author.equals(currUser._id)){
        req.flash("error","You did not create this review:(");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
