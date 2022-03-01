const e = require('express');
const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');
  uuid = require('uuid')

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(bodyParser.urlencoded({ extended: true }));

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
    id:"0",
    name:"john",
    favoriteMovies:['Get Out']
},
{
    id:"1",
    name:"ted",
    favoriteMovies:[]
}
];

// get all users 
app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// get user by id 
app.get('/users/id/:id', (req, res) => {
  res.json(users.find((user) =>
    { return user.id === req.params.id }));
});

//create a new user
app.post('/users/newUser', (req, res) => {
   const newUser = req.body;

    if (newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser);
    } else {
      res.status(400).send('users need names');
    }
});

// update user name by id
app.put('/users/update/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  let user = users.find(user => user.id === id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// add movie to users favorites by user id
app.post('/users/update/:id/:title', (req, res) => {
  const id = req.params.id;
  const title = req.params.title;

  let user = users.find(user => user.id === id);

  if (user) {
    user.favoriteMovies.push(title)
    res.status(200).send(title + ' has been added to ' + id + "'s array");
  } else {
    res.status(400).send("no such user");
  }
});

// delete movie from users favorites by user id
app.delete('/users/delete/:id/:title', (req, res) => {
  const id = req.params.id;
  const title = req.params.title;

  let user = users.find(user => user.id === id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title != title)
    res.status(200).send(title + ' has been removed from ' + id + "'s array");
  } else {
    res.status(400).send("no such user");
  }
});

// delete user by name
app.delete('/users/deleteUser/:name', (req, res) => {
  let user = users.find((user) => { return user.name === req.params.name });

  if (user) {
    users = users.filter((obj) => { return obj.name !== req.params.name });
    res.status(201).send('user ' + req.params.name + ' was deleted.');
  } else {
    res.status(400).send('no such user');
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


/* movies CRUD operations start */

// gets all movies
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// Gets the data about a single movie, by title
app.get('/movies/title/:title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// gets movies by director
app.get('/movies/director/:director', (req, res) => {
    Movies.findOne({ Director: req.params.Director })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// gets movies by genre 
app.get('/movies/genre/:genre', (req, res) => {
    Movies.findOne({ Genre: req.params.Genre })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// Adds data for a new movie to our list.
app.post('/movies', (req, res) => {
    Movies.findOne ({ Title: req.body.Title})
    .then((movie) => {
        if (movie) {
            return res.status(400).send( req.body.Title + 'already exists');
        } else {
            Movies
                .create ({
                    "Title" : req.body.Title,
                    "Description" : req.body.Description,
                    "Genre" : {
                            "Name" : req.body.Genre.Name,
                            "Description" : req.body.Genre.Description,
                    },
                    "Director" : {
                            "Name" : req.body.Director.Name,
                            "Bio" : req.body.Director.Bio,
                            "Birth" : req.body.Director.Birth,
                            "Death" : req.body.Director.Death,
                    },
                    "ImagePath" : req.body.ImagePath,
                    "Featured" : bool,
                })
                .then ((movie) => { res.status(201).json(movie) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error ' + error);
                })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error ' + error);
    });
});

// delete movie by title
app.delete('/movies/:title', (req, res) => {
    Movies.findOneAndRemove({ Title: req.params.Title })
      .then((movie) => {
          if(!movie) {
              res.status(400).send(req.params.Title + ' was not found');
          } else {
              res.status(200).send(req.params.Title + "was deleted")
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error' + err);
      });
});
/* movies CRUD operations end */

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Sorry, something broke');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});




