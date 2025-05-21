const Review=require("../models/review");
const Listing=require("../models/listing");

module.exports.postReview=async(req,res)=>{
    const {id} = req.params;
    let listing= await Listing.findById(id);
    let newReview= new Review(req.body.review);
    newReview.author= req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success"," review added !");
    console.log("review saved");
    res.redirect(`/listings/${id}`);
}
module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const rev= await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted !");
    res.redirect(`/listings/${id}`);
}
