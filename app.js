const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { response } = require('express');
dotenv.config();

const dbService = require('./dbService')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/search/:name', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const { name } = request.params;

    const result = db.getAllShows(name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.get('/show/:name', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const { name } = request.params;

    const result = db.getShowData(name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.listen(process.env.PORT, () => console.log('app is running'));