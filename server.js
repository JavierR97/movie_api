const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');
  uuid = require('uuid')

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( 'mongodb+srv://javier1997:EozMv6uPuDGxFPP7@myflixdbmyfirstdb.6upox.mongodb.net/myFlixDBmyFirstDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://mytestsite.com'];

const { check, validationResult } = require('express-validator');

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

let movies = [
    {
      imgUrl:'https://tinyurl.com/35pytd79',
      title: 'The Conjuring: The Devil Made Me Do It',
      genre:'horror',
      director: 'Michael Chaves'
    },
    {
      imgUrl:'https://tinyurl.com/yj2s6d57',
      title:'The Babadook',
      genre:'horror',
      director: 'Jennifer Kent'
    },
    {
        Title: 'Get Out',
        Description: '',
        Genre: {
            Name: 'Horror',
            Description:'"Horror is a genre of literature, film, and television that is meant to scare, startle, shock, and even repulse audiences.'
        },
        Director: {
            Name: 'Jordan Peele',
            Bio: '',
            Birth: '',
            Death: ''
        },
        ImagePath: 'https://tinyurl.com/yj2s6d57',
        Featured: false,     
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
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/users/id/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ _id: req.params.id })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

//create a new user
app.post('/users/newUser', 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// update user name by username
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username}, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
          }
    });
});

// add movie to users favorites by user ID
app.put('/users/:id/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ _id: req.params.id }, {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
     (err, updatedUser) => {
       if (err) {
         console.error(err);
         res.status(500).send('Error: ' + err);
       } else {
         res.json(updatedUser);
       }
     });
});

// delete movie from users favorites by user id
app.delete('/users/:id/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ _id: req.params.id }, {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
     (err, updatedUser) => {
       if (err) {
         console.error(err);
         res.status(500).send('Error: ' + err);
       } else {
         res.json(updatedUser);
       }
     });
});

// delete user by name
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// users end

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('welcome to my movie API!!');
});

app.get('/secreturl', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.use(express.static('public'));

app.get('/documentation', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});


/* movies CRUD operations start */

// gets all movies
app.get('/movies', passport.authenticate('jwt', { session: false }) ,(req, res) => {
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
app.get('/movies/title/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ Title: req.params.title })
    .then((movie) => {
        console.log(movie);
        res.status(201).json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

// gets movies by director
app.get('/movies/director/:director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ "Director.Name": req.params.director })
    .then((movie) => {
        console.log(movie);
        res.status(201).json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// gets the information of a single director
app.get('/movies/desc/director/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name })
    .then((movie) => {
        res.status(201).json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// gets movies by genre 
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ "Genre.Name": req.params.genre })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

//gets the description of a single genre
app.get('/movies/desc/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    })
});

// Adds data for a new movie to our list.
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
                    "Featured" : Boolean()
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
app.delete('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOneAndRemove({ Title: req.params.title })
      .then((movie) => {
          if(!movie) {
              res.status(400).send(req.params.title + ' was not found');
          } else {
              res.status(200).send(req.params.title + ' was deleted')
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

/* mongoimport --uri mongodb+srv://javier1997:EozMv6uPuDGxFPP7@myflixdbmyfirstdb.6upox.mongodb.net/myFlixDB --collection users --type json --file C:\Users\javie\users.json */



