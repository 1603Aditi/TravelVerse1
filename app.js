if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const path = require("path");
const session =require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")
const Listing=require("./models/listing.js");

const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/users.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// const dbUrl=process.env.ATLASDB_URL;
// const store=MongoStore.create({
//     mongoUrl:dbUrl,
//     crypto:{
//         secret:process.env.SECRET,
//     },
//     touchAfter:24*3600,
// });

// store.on("error",()=>{
//     console.log("Error",err);
// });

const sessionOptions={
    // store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true
};

const MONGO_URL='mongodb://127.0.0.1:27017/travelverse';

async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("connected");
}).catch(err=>{
    console.log(err);
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.get("/",(req,res)=>{
    res.render("front.ejs");
});

app.get("/listings/search", async (req, res) => {
  console.log("yes");
  const { query } = req.query;
  console.log(req.query);
  if (!query || query.trim() === "") {
    return res.redirect("/listings");
  }
  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  });
    res.render("listings/search-results.ejs", { listings });
});

app.get('/filters/:filterType', async (req, res) => {
    const filterType = req.params.filterType;
    console.log("Filter type:", filterType);        
    
    try {
        const filtered = await Listing.find({ category: filterType }); 
        console.log("Filtered listings:", filtered);
        res.render("filters/filtered.ejs", { listings: filtered, filterType });    
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found :("));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong :(" } = err;
    res.render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening");
});

