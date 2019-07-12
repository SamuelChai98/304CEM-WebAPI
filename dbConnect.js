const mongoose = require('mongoose');
const db = "mongodb+srv://Samuel:samuel@cluster0-2qrxd.mongodb.net/Movie?retryWrites=true&w=majority";

mongoose.connect(db, {useNewUrlParser: true}).then(()=> {
    console.log("Connected to database");
})
.catch(()=> {
    console.log("Error connecting to database");
});

const animeSchema = new mongoose.Schema({
    title: { type: String},
    type: { type: String},
    status: { type: String},
    start_date: { type: String},
    end_date: { type: String},
    episodes: { type: String},
    episode_duration: { type: String},
    total_duration: { type: String},
    rated: { type: String},
    rated_guide: { type: String},
    pic_url: { type: String},
    recommendations: { type: String},
    recommendations1: { type: String},
    recommendations2: { type: String}
});

const Anime = mongoose.model('Animes', animeSchema);

module.exports = Anime;