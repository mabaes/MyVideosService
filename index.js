/*
var express = require('express');
var bodyParser = require('body-parser');
// create app
var app = express();
// mount middlewares
app.use(express.static('../MyVideosApp/www'));
app.use(bodyParser.json());
app.listen(8087);
console.log('HTTP server running');
*/
//https://manuelfrancoblog.wordpress.com/2017/09/13/mongodb-arreglos-o-listas/
//https://charlascylon.com/2013-07-25-tutorial-mongodb-operaciones-de-actualizaci%C3%B3n-de-ii
//https://carlosazaustre.es/autenticacion-con-token-en-node-js
//-->https://code.tutsplus.com/es/tutorials/jwt-authentication-in-angular--cms-32006
//-->https://medium.com/@asfo/autenticando-un-api-rest-con-nodejs-y-jwt-json-web-tokens-5f3674aba50e

var express = require('express');
var bodyParser = require('body-parser');
// create app
var app = express();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var jwt = require('jsonwebtoken');
var JWT_Secret = 'curso_web_app_key';

var db;


var init = () => {
    var url = 'mongodb://localhost:27017/myvideos';
    console.log('- connecting to dabatase');
    ////// test /////////
    
    var video = {                                
        "type": 'hola',
        "url": 'url', "title": 'sdas', "date": 'asdas'
    };
    var additem = {
        "id":"asdasdsada"
    }
    console.log(video.url);
   /*
    var usuario = [ { 
        "_id": "5eedd7d09fc452376cf5a471",
        "email": "pau@caracola.com",
        "password": '12345',
        name: 'Pau',
        surname: 'Santacreu Badia',
        id: '5eedd7d09fc452376cf5a471',
        videos: [ "5eee33f4cc921c1530cfc9f6", "5eee3a7882c7af3c98f0bf10" ] } ];
    //var tmp = JSON.parse(usuario);
    console.log (usuario[0]['videos']);
    */
   /* 
   var tmp = {
       "v2": { 
           id: "v2", 
           type: "local"} 
       };
    console.log(tmp);   
    */

    ////// end test /////
    MongoClient.connect(url, (err, _db) => {
        if (err) {
            console.log(' - unable to open connection');
            process.exit();
        } else {
            console.log(' - connection opened');
            db = _db;
        }
    });
};
init();



/*** db rellenado*/
/*
var db ={};

db = {
    "1": {
        id: "1", email: "laura@caracola.com", password: "12345", name: "Pepe", surname: "Sanchez",
        videos: {
            "EuZBbjRHgLk": {
                "id": "EuZBbjRHgLk",
                "type": "youtube",
                "url": "https://www.youtube.com/watch?v=EuZBbjRHgLk",
                "title": "Osito panda estornuda y asusta a la madre",
                "description": "Menudo susto le dá este pequeños a su madre",
                "thumbnail": {
                    "url": "assets/videos/oso-panda.jpg",
                    "width": "200",
                    "height": "150"
                },

                "tags": "panda, gracioso, animales, susto",
                "duration": "12seg",
                "height": "340",
                "width": "450"

            },
            "v2":

            {
                "id": "v2",
                "type": "local",
                "url": "/assets/videos/girl-happy.mp4",
                "title": "La felicidad",
                "description": "La primareva y la felicicdad",
                "thumbnail": {
                    "url": "assets/videos/girl-happy.jpg",
                    "width": "200",
                    "height": "150"
                },

                "tags": "campo,naturaleza, felicidad, flores",
                "duration": "120seg",
                "height": "340",
                "width": "450"

            }
        },
        ///////////////////////////////////////////////////////////////////////////
        playlists: {
            "p1": {

                "id": "p1",
                "title": "Videos Relax",
                "description": "los mejores videos para relajarse mucho" ,
                "thumbnail": {
                    "url": "/assets/videos/naturaleza.jpg",
                    "width": "100",
                    "height": "400"
                },
                "date": "12/12/2020",
                "count": "2",
                "idVideos": {
                    "EuZBbjRHgLk": { id: "EuZBbjRHgLk", 
                            type: "youtube"},
                    "v2": { id: "v2", 
                            type: "local"}
                }
                
            },
            "p2": {
                "id": "p2",
                "title": "Videos Divertidos",
                "description": "los mejores videos para divertirse",
                "thumbnail": {
                    "url": "/assets/videos/naturaleza.jpg",
                    "width": "100",
                    "height": "400"
                },
                "date": "12/12/2020",
                "count": "1",
                "idVideos": {                   
                    "v2": { id: "v2", 
                            type: "local"}
                }
                
            },



        }
        ///////////////////////////////////////////////////////////////////////////        
    },
    "2": {
        id: "2", email: "pau@caracola.com", password: "12345", name: "Juan", surname: "Sinmiedo",
        videos: {},
        playlists: {}
    },
}
*/
/** fin db */

/**** AUTENTIFICACIÓN */
// mount middlewares
// - CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method == 'OPTIONS') {
        res.status(200).send();
    } else {
        next();
    }
});

// mount middlewares
app.use(express.static('../MyVideosApp/www'));
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));




app.use(function (req, res, next) {
    console.log(req.method + ':' + req.url);
    if (!req.url.startsWith('/myvideos') ||
        (req.url === '/myvideos/sessions') ||
        (req.url === '/myvideos/users' && req.method === 'POST')) {
        next();
    } else if (!req.query.token) {
        res.send(401, 'Token missing.');
    } else {
        //_token = req.query.token.toString().trim();
        _token = req.query.token;
        /*
        if(!ObjectID.isValid(_token)) res.send(401, 'Invalid token.');
        */
       ///////////////////////////// nuevo //////////////////////////////////
       jwt.verify(_token, JWT_Secret, (err, decoded) => {      
            if (err) {
                res.send(401, 'Token not valid.');
            } else {
                //console.log('id_user::');
                //console.log(decoded._id);
                _idUser = decoded._id;
                if(!ObjectID.isValid(_idUser)) res.send(401, 'Invalid token.');
                db.collection('users').findOne(
                    { _id: ObjectID.createFromHexString(_idUser) },
                        (err, doc) => {
                            if (err) res.send(500);
                                else if (!doc) res.send(401, 'user and token not valid');
                            else next();                
                    });
                //next();
            }
         });
       ///////////////////////// fin nuevo /////////////////////////////////
       /////////////// test ////////////////////////////////////////////////
       /*
       //JWT.verify(req.cookies['token'], 'YOUR_SECRET', function(err, decodedToken) {
       // if(err) { /* handle token err */ }
       // else {
       //  req.userId = decodedToken.id;   // Add to req object
       //  next();
       // }
      //});
       ///////////// end test /////////////////////////////////////////////
       
       /*db.collection('users').findOne(
            { _id: ObjectID.createFromHexString(_token) },
            (err, doc) => {
                if (err) res.send(500);
                else if (!doc) res.send(401, 'Invalid token');
                else next();                
            });
            */
    //}
});



// define routes
// sessions
app.post('/myvideos/sessions', function (req, res) {
    console.log('POST /myvideos/sessions');
    if (!req.body.email || !req.body.password) res.send(400, 'Missing data');
    else {
        _user = req.body.email.toString().trim();
        _password = req.body.password.toString().trim();
        db.collection('users').findOne(
            { email: _user, password: _password },
            (err, doc) => {
                console.log(doc);
                if (err) res.send(500);
                else if (!doc) res.send(401);
                else {
                    let payload = { "_id" : doc._id.toHexString()};
                    let _token = jwt.sign( payload,JWT_Secret,  { noTimestamp:true, expiresIn: '1h' });
                    res.send({
                        userId: doc._id.toHexString(),
                        token : _token
                    });
                }
                //else res.send({
                //    userId: doc._id.toHexString(),
                //    token: doc._id.toHexString()
                //});
            });
    }
});



// mount middlewares


/*** FIN AUTENTIFICACIÓN */


// users
app.get('/myvideos/users', function (req, res) {
    console.log('GET /myvideos/user/');
    db.collection('users').find().toArray((err, docs) => {
        if (err) res.send(500);
        else res.send(docs.map((doc) => {
            var user = {
                id: doc._id.toHexString(), 
                email: doc.email, 
                name: doc.name,
                surname: doc.surname
            };
            return user;
        }));
    });
});


app.post('/myvideos/users', function (req, res) {
    console.log('POST /myvideos/users');
    if (!req.body.email || !req.body.password || !req.body.name ||
        !req.body.surname)
        res.send(400, 'Missing data');
    else {
        var user = {
            email: req.body.email, password: req.body.password,
            name: req.body.name, surname: req.body.surname
        };
        db.collection('users').insertOne(user, (err, result) => {
            if (err) res.send(500);
            else res.send({
                id: result.insertedId.toHexString(), name: user.name,
                surname: user.surname, email: user.email
            });
        });
    }
});

app.get('/myvideos/users/:userId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').findOne(
            { _id: ObjectID.createFromHexString(userId) },
            (err, doc) => {
                if (err) res.send(500);
                else if (!doc) res.send(404, 'User not found');
                else {
                    var user = {
                        id: doc._id.toHexString(), email: doc.email,
                        name: doc.name, surname: doc.surname
                    };
                    res.send(user);
                }
            });
    }
});


app.put('/myvideos/users/:userId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').findOne(
            { _id: ObjectID.createFromHexString(userId) },
            (err, doc) => {
                if (err) res.send(500);
                else if (!doc) res.send(404, 'User not found');
                else {
                    var user = {
                        id: doc._id.toHexString(), name: req.body.name || doc.name,
                        surname: req.body.surname || doc.surname,
                        email: req.body.email || doc.email,
                        password: req.body.password || doc.password
                    };
                    db.collection('users').updateOne(
                        { _id: ObjectID.createFromHexString(userId) },
                        { $set: user },
                        (err, doc) => {
                            if (err) res.send(500, err);
                            else res.send(user);
                        });
                }
            });
    }
});



app.delete('/myvideos/users/:userId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').deleteOne(
            { _id: ObjectID.createFromHexString(userId) },
            (err, result) => {
                if (err) res.send(500, err);
                else res.send(204);
            });
    }
});



//*************videos **************/

/** OK Actualizado */
 app.get('/myvideos/users/:userId/videos', function (req, res) {
    console.log('GET /myvideos/user/' + req.params.userId + '/videos');
    var userId = req.params.userId;
    var _query = req.query.q;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        _user = userId.trim();
        console.log(_user);
        //db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
        db.collection('users').find({ _id: ObjectID.createFromHexString(userId) }).toArray((err, doc) => {    
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                if (!_user) {
                    res.send(400, 'Missing data');
                } else {
                    _videos = doc[0]['videos'];
                    var _parametros = {                                
                        _id: {$in:_videos}                        
                    };
                    if (_query) {
                        _parametros.title = {'$regex': _query}
                    }
                        console.log(_parametros);
                        
                        console.log('videos: ');
                        console.log(doc);
                        //console.log(doc['videos']);
                        console.log(doc[0]['videos']);
                        console.log(typeof(doc[0]['videos']));
                        //db.collection('videos').find({_id: {$in:_videos}}).toArray((err, docs) => {
                        //db.collection('videos').find({_id: {$in:_videos},title: {'$regex': _query}}).toArray((err, docs) => {
                        db.collection('videos').find(_parametros).toArray((err, docs) => {    
                            if (err) res.send(500);
                            else res.send(docs.map((doc) => {
                                //console.log(docs);
                                var video = {
                                    id: doc._id.toHexString(), 
                                    type: doc.type, 
                                    url: doc.url,
                                    title: doc.title,
                                    description:doc.description,
                                    thumbnail : doc.thumbnail,
                                    tags: doc.tags,
                                    duration:doc.duration,
                                    date:doc.date,
                                    width:doc.width,
                                    height:doc.height
                                };
                                return video;
                            }));
                        });
                    

                }
            } //end else
        });
    } //end else
});



/** OK ACtualizado */
app.post('/myvideos/users/:userId/videos', function (req, res) {
    console.log('POST /myvideos/user/' + req.params.userId + '/videos');
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        _user = userId.trim();
        console.log(_user);
        db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                if (!req.body.type || !req.body.url || !req.body.title) {
                    res.send(400, 'Missing data');
                } else {
                    var video = {
                        type: req.body.type,
                        url: req.body.url, title: req.body.title, date: Date.now()
                    };
                    if (req.body.description) video.description = req.body.description;
                    if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
                    if (req.body.tags) video.tags = req.body.tags;
                    if (req.body.width) video.width = req.body.width;
                    if (req.body.height) video.height = req.body.height;
                    db.collection('videos').insertOne(video, (err, result) => {
                        if (err) res.send(500);
                        else  {
                            ////////////////////////////////////
                            _videoId =result.insertedId.toHexString();
                            video.id = _videoId;
                            db.collection('users').updateOne(
                                { _id: ObjectID.createFromHexString(userId) },
                                { $addToSet: { videos : result.insertedId } },
                                (err, doc) => {
                                    if (err) res.send(500, err);                                    
                                    res.send(video);
                                });
                            ///////////////////////////////////
                           
                            
                        }//res.send(result);
                    });

                }
            } //end else
        });
    } //end else
});


/*OK Actualizado */
app.get('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    console.log('video' + videoId);
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                db.collection('videos').find({ _id: ObjectID.createFromHexString(videoId) }).toArray((err, docs) => {
                    if (err) res.send(500);
                    else if (!docs) res.send(404, 'Video not found');
                    else {
                        res.send(docs.map((doc) => {

                            var video = {
                                id: doc._id.toHexString(),
                                type: doc.type,
                                url: doc.url,
                                title: doc.title,
                                description: doc.description,
                                thumbnail: doc.thumbnail,
                                tags: doc.tags,
                                duration: doc.duration,
                                date: doc.date,
                                width: doc.width,
                                height: doc.height
                            };
                            return video;
                        }));
                    }
                });
            } //end else
        });
    }
});   


/** OK Actuallzado */
app.put('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    if (!userId || !videoId || videoId=='undefined' ) res.send(400, 'Missing parameter');
    else {
        _videoId = [ObjectID.createFromHexString(videoId)];//5eee3a7882c7af3c98f0bf10
        db.collection('users').findOne({ 
            _id: ObjectID.createFromHexString(userId), videos: {$in: _videoId} }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Video not found');
            else {
                var video = {
                    type: req.body.type,
                    url: req.body.url, title: req.body.title, date: Date.now()
                };
                if (req.body.description) video.description = req.body.description;
                if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
                if (req.body.tags) video.tags = req.body.tags;
                if (req.body.width) video.width = req.body.width;
                if (req.body.height) video.height = req.body.height;
                db.collection('videos').updateOne(
                    { _id: ObjectID.createFromHexString(videoId) },
                    { $set: video },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        else res.send(video);
                    });
            }
        });
    }
});



/**Ok Actualizado */
/** elimina un video tb de las playlists que está asociado */
app.delete('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else {
        _videoId = [ObjectID.createFromHexString(videoId)];//5eee3a7882c7af3c98f0bf10
        db.collection('users').findOne({
            _id: ObjectID.createFromHexString(userId), videos: { $in: _videoId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Video not found');
            else {
                db.collection('users').updateOne(
                    { _id: ObjectID.createFromHexString(userId) },
                    { $pull: { videos: ObjectID.createFromHexString(videoId) } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        //else res.send(204);
                        else {
                            db.collection('playlists').update(
                                {},
                                { $pull: { idVideos: { id: ObjectID.createFromHexString(videoId) } } },
                                (err, doc) => {
                                    if (err) res.send(500, err);
                                    else {
                                        //////////////
                                        db.collection('videos').remove({ _id: ObjectID.createFromHexString(videoId) },
                                            (err, doc) => {
                                                if (err) res.send(500, err);
                                                else res.send(204);
                                            }
                                        );
                                        //////////////////////
                                    }
                                });

                        } // end else

                    });

            }
        });

    }
});



// ********************* *****************/
// playlists
// ********************* *****************/
/** OK actualizado */
    app.get('/myvideos/users/:userId/playlists', function (req, res) {
    console.log('GET /myvideos/user/' + req.params.userId + '/playlists');    
    var userId = req.params.userId;
    var _query = req.query.q;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        _user = userId.trim();
        console.log(_user);
        //db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
        db.collection('users').find({ _id: ObjectID.createFromHexString(userId) }).toArray((err, doc) => {    
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                if (!_user) {
                    res.send(400, 'Missing data');
                } else {
                    _playlists = doc[0]['playlists'];
                    var _parametros = {                                
                        _id: {$in:_playlists}                        
                    };
                    if (_query) {
                        _parametros.title = {'$regex': _query}
                    }
                        db.collection('playlists').find(_parametros).toArray((err, docs) => {    
                            if (err) res.send(500);
                            else res.send(docs.map((doc) => {
                                //console.log(docs);
                                var playlist = {
                                    id: doc._id.toHexString(), 
                                    title: doc.title,
                                    description:doc.description,
                                    thumbnail : doc.thumbnail,
                                    date:doc.date,
                                    count:doc.count
                                };
                                return playlist;
                            }));
                        });
                    

                }
            } //end else
        });
    } //end else
});


/** Ok actualizado */
app.post('/myvideos/users/:userId/playlists', function (req, res) {
    console.log('POST /myvideos/user/' + req.params.userId + '/playlists');
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else {
        _user = userId.trim();
        console.log(_user);
        db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else if (!req.body.title || !req.body.description)
                res.send(400, 'Missing data');
            else {
                var playlist = {
                    title: req.body.title,
                    description: req.body.description,
                    date: Date.now(),
                    count: 0,
                    //idVideos: {}
                };
                if (req.body.thumbnail) playlist.thumbnail = req.body.thumbnail;
                var ret = {
                    id: playlist.id, title: playlist.title,
                    description: playlist.description, date: playlist.date
                };
                //////////////////////////////////////////////////////////////
                db.collection('playlists').insertOne(playlist, (err, result) => {
                    if (err) res.send(500);
                    else {
                        _playlistId = result.insertedId.toHexString();
                        //video.id = _videoId;
                        db.collection('users').updateOne(
                            { _id: ObjectID.createFromHexString(userId) },
                            { $addToSet: { playlists: result.insertedId } },
                            (err, doc) => {
                                if (err) res.send(500, err);
                                else res.send(playlist);
                            });
                    }
                });
                ///////////////////////////////////////////////////////////////

            } //end else
        });
    }
});

/** OK actualizado  */
app.get('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                db.collection('playlists').find({ _id: ObjectID.createFromHexString(playlistId) }).toArray((err, docs) => {
                    if (err) res.send(500);
                    else if (!docs) res.send(404, 'Video not found');
                    else {
                        res.send(docs.map((doc) => {

                            var playlist = {
                                id: doc._id.toHexString(),
                                title: doc.title,
                                description: doc.description,
                                thumbnail: doc.thumbnail,
                                date: doc.date,
                                count: doc.count
                            };
                            return playlist;
                        }));
                    }
                });
            } //end else
        });
    }
   
});


/** OK actualizado falta obtener el count */
app.put('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({ 
            _id: ObjectID.createFromHexString(userId), playlists: {$in: _playlistId} }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlist not found');
            else {
                var playlist = {
                    title: req.body.title, 
                    date: Date.now(),
                    description : req.body.description
                };
                if (req.body.thumbnail) playlist.thumbnail = req.body.thumbnail;
                db.collection('playlists').updateOne(
                    { _id: ObjectID.createFromHexString(playlistId) },
                    { $set: playlist },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        else res.send(playlist);
                    });
            }
        });
    }
});


/** OK Actualizado */
app.delete('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({
            _id: ObjectID.createFromHexString(userId), playlists: { $in: _playlistId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlists not found');
            else {
                db.collection('users').updateOne(
                    { _id: ObjectID.createFromHexString(userId) },
                    { $pull: { playlists : ObjectID.createFromHexString(playlistId) } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        //else res.send(204);
                        else {
                            ////////////////////////////
                            db.collection('playlists').remove({ _id: ObjectID.createFromHexString(playlistId) },
                                            (err, doc) => {
                                                if (err) res.send(500, err);
                                                else res.send(204);
                                            }
                                        );
                            ////////////////////////////
                        }
                    });

            }
        });

    }
});


/**Actualizado*/
app.post('/myvideos/users/:userId/playlists/:playlistId/videos', function (req, res) {
    console.log('POST /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({
           _id: ObjectID.createFromHexString(userId), playlists: { $in: _playlistId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlist not found');
            else {
                var video = {
                    id: req.body.id,
                    type: req.body.type,
                    url: req.body.url,
                    title: req.body.title,
                };
                if (req.body.description) video.description = req.body.description;
                if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
                if (req.body.tags) video.tags = req.body.tags;
                if (req.body.width) video.width = req.body.width;
                if (req.body.height) video.height = req.body.height;
                if (req.body.duration) video.height = req.body.duration;
                console.log(video.id);
                var _videoIdAdd = video.id.toString();
                var _videoTypeAdd = video.type.toString();
                var _videoAdd = {
                    id: _videoIdAdd, 
                    type: _videoTypeAdd
                }
                /*var _videoAdd = {
                        [_videoIdAdd]: { 
                            id: _videoIdAdd, 
                            type: _videoTypeAdd
                        } 
                };
                */
                console.log('video Add to Playlist');
                console.log(_videoAdd);
                /*
                db.collection('playlists').updateOne(
                    { _id: ObjectID.createFromHexString(playlistId) },
                    { $addToSet: { idVideos: _videoAdd } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        else res.send(204);
                    });
                */
               db.collection('playlists').updateOne(
                { _id: ObjectID.createFromHexString(playlistId) },
                { $addToSet: { idVideos: _videoAdd }, $inc: {count:1} },
                (err, doc) => {
                    if (err) res.send(500, err);
                    else res.send(204);
                });

            }
        });
    }
});

/* seguridad funciona como array videos de objectID */
/*
app.post('/myvideos/users/:userId/playlists/:playlistId/videos', function (req, res) {
    console.log('POST /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({
            _id: ObjectID.createFromHexString(userId), playlists: { $in: _playlistId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlist not found');
            else {
                var video = {
                    id: req.body.id,
                    type: req.body.type,
                    url: req.body.url,
                    title: req.body.title,
                };
                if (req.body.description) video.description = req.body.description;
                if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
                if (req.body.tags) video.tags = req.body.tags;
                if (req.body.width) video.width = req.body.width;
                if (req.body.height) video.height = req.body.height;
                if (req.body.duration) video.height = req.body.duration;
                console.log(video.id);
                db.collection('playlists').updateOne(
                    { _id: ObjectID.createFromHexString(playlistId) },
                    { $addToSet: { idVideos: ObjectID.createFromHexString(video.id) } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        else res.send(204);
                    });

            }
        });
    }
});
*/

/** OK actualizado  */
/** controlar que el video no es null */
app.get('/myvideos/users/:userId/playlists/:playlistId/videos', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({
            _id: ObjectID.createFromHexString(userId), playlists: { $in: _playlistId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlist not found');
            else {
                ////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                db.collection('playlists').find({ _id: ObjectID.createFromHexString(playlistId) }).toArray((err, doc) => {
                    if (err) res.send(500);
                    else if (!doc) res.send(404, 'Playlist not found');
                    else {
                        _idVideos = doc[0]['idVideos'];
                        console.log(_idVideos);
                        _idVideosObj = [];
                        for (let _idVideo of _idVideos) {
                            if(ObjectID.isValid(_idVideo.id)) {
                                console.log('es valido');
                                console.log(_idVideo.id);
                                _idVideosObj.push (ObjectID.createFromHexString(_idVideo.id));
                            }
                            
                        } //for
                        var _parametros = {
                            _id: { $in: _idVideosObj }
                        };
                        db.collection('videos').find(_parametros).toArray((err, docs) => {
                            if (err) res.send(500);
                            else res.send(docs.map((doc) => {
                                //console.log(docs);
                                if (doc.type == 'local') {
                                    video = {
                                        id: doc._id.toHexString(),
                                        type: doc.type,
                                        url: doc.url,
                                        title: doc.title,
                                        description: doc.description,
                                        thumbnail: doc.thumbnail,
                                        tags: doc.tags,
                                        duration: doc.duration,
                                        date: doc.date,
                                        width: doc.width,
                                        height: doc.height
                                    };
                                }
                                else {
                                    video = {
                                        id: doc._id.toHexString(),
                                        type: doc.type
                                    }
                                }

                                return video;
                            }));
                        });
                    } //end else
                });

                //////////////////////////////////////////////////////////
                ////////////////////////////////////////////////
            } //end else
        });
    } //else

});


/** seguridad como estaba inicalmente */
/*
app.get('/myvideos/users/:userId/playlists/:playlistId/videos', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({ 
            _id: ObjectID.createFromHexString(userId), playlists: {$in: _playlistId} }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlist not found');
            else {
                ////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                db.collection('playlists').find({ _id: ObjectID.createFromHexString(playlistId) }).toArray((err, doc) => {    
                    if (err) res.send(500);
                    else if (!doc) res.send(404, 'Playlist not found');
                    else {
                            _idVideos = doc[0]['idVideos'];
                            
                            var _parametros = {                                
                                _id: {$in:_idVideos}                        
                            };
                                //console.log(_parametros);
                                //console.log('videos: ');
                                //console.log(doc);
                                //console.log(doc[0]['idVideos']);
                                //console.log(typeof(doc[0]['videos']));
                                
                                db.collection('videos').find(_parametros).toArray((err, docs) => {    
                                    if (err) res.send(500);
                                    else res.send(docs.map((doc) => {
                                        //console.log(docs);
                                        if (doc.type=='local') {
                                            video = {
                                                id: doc._id.toHexString(), 
                                                type: doc.type, 
                                                url: doc.url,
                                                title: doc.title,
                                                description:doc.description,
                                                thumbnail : doc.thumbnail,
                                                tags: doc.tags,
                                                duration:doc.duration,
                                                date:doc.date,
                                                width:doc.width,
                                                height:doc.height
                                            };
                                        }
                                        else {
                                            video = {
                                                id: doc._id.toHexString(), 
                                                type: doc.type 
                                            }
                                        }
                                        
                                        return video;
                                    }));
                                });
                    } //end else
                });

                //////////////////////////////////////////////////////////
                ////////////////////////////////////////////////
            } //end else
        });
    } //else
   
});
*/


/** Ok actualizado revisar si borrar un video definitivamente / al igual que la playlist */
app.delete('/myvideos/users/:userId/playlists/:playlistId/videos/:videoId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' + req.params.playlistId + '/videos/' + req.params.videoId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    var videoId = req.params.videoId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else {
        _playlistId = [ObjectID.createFromHexString(playlistId)];
        db.collection('users').findOne({
            _id: ObjectID.createFromHexString(userId), playlists: { $in: _playlistId }
        }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User or Playlists not found');
            else {
                db.collection('playlists').updateOne(
                    { _id: ObjectID.createFromHexString(playlistId) },
                    { $pull: { idVideos : ObjectID.createFromHexString(videoId) } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        else res.send(204);
                    });

            }
        });

    }
});

////////////////////////
app.listen(8087);
console.log('HTTP server running');