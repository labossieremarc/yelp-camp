if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    }

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const {places, descriptors} = require('./seeds/seedHelper')
const methodOverride = require('method-override');
const engine = require('ejs-mate')
const ExpressError = require('./utilities/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require("./models/user")
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const MongoDBStore = require("connect-mongo")(session)

const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const usersRoutes = require("./routes/users")
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})



const app = express();

app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
const secret = process.env.SECRET || 'thisisabadsecret';
const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("session store error", e)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

const scriptSrctUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
]

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://use.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net"
]
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
]

const fontSrcUrls = []

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrctUrls],
            styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/midnight/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
   
    })
)




app.use(session(sessionConfig))
app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize());
app.use(passport.session())
app.use(mongoSanitize())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(flash());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")))

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/campgrounds', campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", usersRoutes)

app.get('/', (req, res) =>{
    res.render('home')
})


app.all('*', (req, res, next) => {
   next(new ExpressError('Page not Found', 404))
})


app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if(!err.message) err.message = "Something went wrong"
    res.status(status).render('error', {err})
    
})

app.listen(3000, () => {
    console.log("listening on http://localhost:3000/campgrounds")
})