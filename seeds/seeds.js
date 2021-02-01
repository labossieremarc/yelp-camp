
const mongoose = require('mongoose');
const campground = require('../models/campground');
const Campground = require('../models/campground')
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i =0; i <250; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20+ 10);
        const camp = new Campground({
            author: '6013071b7e597c3b98487ea5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic ducimus odit officiis ea maiores deserunt ut culpa non exercitationem earum commodi, consequatur repellendus recusandae quos delectus eos quisquam facilis minus!',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude,cities[random1000].latitude]
            },
            images: [
                {
                url : "https://res.cloudinary.com/midnight/image/upload/v1611954081/Yelpcamp/lqgfaqmg1zlffirn2hec.jpg",
                    filename: "Yelpcamp/lqgfaqmg1zlffirn2hec"
                },
                {
                    url: "https://res.cloudinary.com/midnight/image/upload/v1611954081/Yelpcamp/bvo5rvpu9b3cbaf7th0x.jpg",
                    filename: "Yelpcamp/bvo5rvpu9b3cbaf7th0x"
                },
                {
                    url: "https://res.cloudinary.com/midnight/image/upload/v1612043489/Yelpcamp/yfnux36a0saljjgncrik.jpg",
                    filename: "Yelpcamp/yfnux36a0saljjgncrik"
                }]
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
}
)