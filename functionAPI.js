const axios = require('axios');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(__dirname+'/public')); 

const Anime = require('./dbConnect');
const anititle =  ['noragami', 'noragami%20aragoto'];
const querystr = `https://kitsu.io/api/edge/anime?filter[text]=`;
const querystr1 = `https://api.jikan.moe/v3/search/anime?q=`;

//Add thru array method
async function test() {
    const addAnimesAPI = await loopAnimeList();
}

async function loopAnimeList() {
    for(const searchTerm of anititle) {
       const addAnimeOperation = await getAnimeFromAPI(querystr + `${searchTerm}`, querystr1 + `${searchTerm}`);
    }
}

async function getAnimeFromAPI(searchQuery1, searchQuery2) {
    const result = await retrieveFromAPI(searchQuery1, searchQuery2);
}

//Retrieve data from multiple API
async function retrieveFromAPI(searchQuery1, searchQuery2, res=null) {
    axios.get(searchQuery1).then((response) =>{
        var title = (response.data.data[0].attributes.titles.en);
        var type = (response.data.data[0].attributes.subtype);
        var status = (response.data.data[0].attributes.status)
        var start_date = (response.data.data[0].attributes.startDate);
        var end_date = (response.data.data[0].attributes.endDate);
        var episodes = (response.data.data[0].attributes.episodeCount);
        var episode_duration = (response.data.data[0].attributes.episodeLength);
        var total_duration = (response.data.data[0].attributes.totalLength);
        var rated = (response.data.data[0].attributes.ageRating);
        var rated_guide = (response.data.data[0].attributes.ageRatingGuide);
        
    
        axios.get(searchQuery2).then((response1) =>{
            var anime_id = (response1.data.results[0].mal_id);
            var pic_url = (response1.data.results[0].image_url);
            const querystr2 = `https://api.jikan.moe/v3/anime/${anime_id}/recommendations`;
        
            axios.get(querystr2).then((response2) =>{
                var recommendations = (response2.data.recommendations[0].title);
                var recommendations1 = (response2.data.recommendations[1].title);
                var recommendations2 = (response2.data.recommendations[2].title);
               
                anime = new Anime ({
                    title: title,
                    type: type,
                    status: status,
                    start_date: start_date,
                    end_date: end_date,
                    episodes: episodes,
                    episode_duration: episode_duration,
                    total_duration: total_duration,
                    rated: rated,
                    rated_guide: rated_guide,
                    pic_url: pic_url,
                    recommendations: recommendations,
                    recommendations1: recommendations1,
                    recommendations2: recommendations2
                });
                
                //Insert data to database
                anime.save().then(resp => {
                    console.log(`Success: ${resp}`);
                    if(res !== null) res.status(200).send(`Anime successfully added`);
                })
                .catch(err => {
                    console.error(`Error: ${err}`);
                    if(res !== null) res.status(400).send(err);
                });  
            });
        });
    })
    .catch(err => {
        console.error(`${err}`);
    });
}

//test()


//Enable fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//Heroku successfully launched
app.get('/', (req, res, next) => {
    res.send('Anime API is now live');
    console.log(`Directory name: ${__dirname}`);
});

//Nav URL to client.html
app.get('/client', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

//Nav URL to admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

//Fuzzy search anime title
app.get('/searchAnime/:title', cors() ,(req, res, next) => {
    const regex = new RegExp(escapeRegex(req.params.title), 'gi'); //Set to case insensitive
    Anime.find({
        'title': regex 
    })
    .then(result => {
        res.send(result);
    })
    .catch(err => {
        res.status(400).send(err);
    });
});

//Retrieve all animes from db
app.get('/getAllAnimes', (req, res) => {
    Anime.find({})
      .then(response => {
        res.status(200).json(response);
      })
      .catch(error => {
        res.status(400).json(error);
      });
});

//Add anime by title
app.get('/addAnime/:title', (req, res, next) => {
    const searchTerm = req.params.title;
    const url1 = querystr + `${searchTerm}`;
    const url2 = querystr1 + `${searchTerm}`;
    const result = retrieveFromAPI(url1, url2, res);
});

//Delete anime by id
app.get('/deleteAnime/:id', (req, res, next) => {
    Anime.findByIdAndDelete(req.params.id)
        .then(result => {
            res.send(`Anime successfully deleted`);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

//Set port to 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('server listening on port 3000');
});