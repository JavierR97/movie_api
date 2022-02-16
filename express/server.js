const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

let movies = [
    {
      imgUrl:'https://tinyurl.com/35pytd79',
      title: 'The Conjuring: The Devil Made Me Do It',
      genre:'horror',
      director: 'Michael Chaves'
    },
    {
      imgUrl: 'https://tinyurl.com/2p959ukk',
      title:'Get Out',
      genre:'horror',
      director: 'Jordan Peele'
    },
    {
      imgUrl:'https://tinyurl.com/yj2s6d57',
      title:'The Babadook',
      genre:'horror',
      director: 'Jennifer Kent'
    },
    {
      imgUrl:'https://tinyurl.com/8hanet65',
      title:'IT(2017)',
      genre:'horror',
      director: 'Andrés Muschietti'
    },
    {
      imgUrl:'https://tinyurl.com/ycyfbw2c',
      title:'The Cabin in the Woods (2011)',
      genre:'horror',
      director: 'Drew Goddard'
    },
    {
      imgUrl:'https://tinyurl.com/j7fkd22k',
      title:'A Quiet Place(2018)',
      genre:'horror',
      director: 'John Krasinski'
    },
    {
      imgUrl:'https://tinyurl.com/yc4x27p4',
      title: 'The Blair Witch Project (1999)',
      genre:'horror',
      director: 'Daniel Myrick'
    },
    {
      imgUrl:'https://tinyurl.com/2p8edub7',
      title:'The Exorcist (1973)',
      genre:'horror',
      director:'William Friedkin'
    },
    {
      imgUrl:'https://tinyurl.com/2p9cvvcf',
      title:'The Shining (1980)',
      genre:'horror',
      director:'Stanley Kubrick'
    },
    {
      imgUrl:'https://tinyurl.com/5e86dktm',
      title:'Sinister (2012)',
      genre:'horror',
      director: 'Scott Derrickson'
    },
    {
      imgUrl:'https://tinyurl.com/2p9apdpt',
      title: 'The Mitachells vs The Machines',
      genre:'comedy',
      director:'Micheal Rianda'
    }
]; 

// users start
var users = [
  
{
    name:"john"
},
{
    name:"ted"
}
];

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    users.push(newUser);
    res.status(201).send(newUser);
  }
});


app.delete('/users/:name', (req, res) => {
  let user = users.find((user) => { return user.name === req.params.name });

  if (user) {
    users = users.filter((obj) => { return obj.name !== req.params.name });
    res.status(201).send('user ' + req.params.name + ' was deleted.');
  }
});

// users end

app.get('/', (req, res) => {
  res.send('welcome to my movie API!!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.use(express.static('public'));

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

// Gets the list of data about ALL movies
/* '/movies' is the url endpoint ex. 
localhost:8080/movies

res.json returns the data within your variable called
'movies' */

app.get('/movies', (req, res) => {
  res.json(movies);
});

// Gets the data about a single movie, by name

app.get('/movies/title/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.title === req.params.title }));
});

app.get('/movies/director/:director', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.director === req.params.director }));
});

app.get('/movies/genre/:genre', (req, res) => {
  res.json(movies.filter((movie) =>
    { 
      return movie.genre === req.params.genre;
    }));
});


// Adds data for a new movie to our list.
app.post('/movies', (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title) {
    const message = 'Missing title in request body';
    res.status(400).send(message);
  } else {
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

app.delete('/movies/:title', (req, res) => {
  let movie = movies.find((movie) => { return movie.title === req.params.title });

  if (movie) {
    movies = movies.filter((obj) => { return obj.title !== req.params.title });
    res.status(201).send('movie ' + req.params.title + ' was deleted.');
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Sorry, something broke');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});