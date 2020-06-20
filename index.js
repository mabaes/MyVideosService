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

var express = require('express');
var bodyParser = require('body-parser');
// create app
var app = express();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
/*
var db;


var init = () => {
    var url = 'mongodb://localhost:27017/myvideos';
    console.log('- connecting to dabatase');
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

*/

/*** db rellenado*/
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
        res.send(401, 'Token missing');
    } else if (!db[req.query.token]) {
        res.send(401, 'Invalid token');
    } else {
        next();
    }
});
// define routes
// sessions
app.post('/myvideos/sessions', function (req, res) {
    console.log('POST /myvideos/sessions');
    if (!req.body.email || !req.body.password) res.send(400, 'Missing data');
    else {
        for (var id in db) {

            if (db[id].email === req.body.email &&
                db[id].password === req.body.password) {
                res.send({ userId: id, token: id });
                return;
            }
        }
        res.send(401);
    }
});

/*** FIN AUTENTIFICACIÓN */




// users
app.get('/myvideos/users', function (req, res) {
    console.log('GET /myvideos/user/');
    var users = [];
    for (var id in db) {
        users.push({
            id: db[id].id, email: db[id].email, name: db[id].name,
            surname: db[id].surname
        });
    }
    res.send(users);
});


app.post('/myvideos/users', function (req, res) {
    console.log('POST /myvideos/users');
    if (!req.body.email || !req.body.password ||
        !req.body.name || !req.body.surname)
        res.send(400, 'Missing data');
    else {
        var userId = String(Date.now());
        db[userId] = {
            id: userId, email: req.body.email,
            password: req.body.password, name: req.body.name,
            surname: req.body.surname, videos: {}, playlists: {}
        };
        res.send({
            id: userId, name: db[userId].name,
            surname: db[userId].surname
        });
    }
});

app.get('/myvideos/users/:userId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        res.send({
            id: userId, email: db[userId].email, name: db[userId].name,
            surname: db[userId].surname
        });
    }
});


app.put('/myvideos/users/:userId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        db[userId].email = req.body.email || db[userId].email;
        db[userId].password = req.body.password || db[userId].password;
        db[userId].name = req.body.name || db[userId].name;
        db[userId].surname = req.body.surname || db[userId].surname;
        res.send({
            id: userId, email: db[userId].email, name: db[userId].name,
            surname: db[userId].surname
        });
    }
});

app.delete('/myvideos/users/:userId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        delete db[userId];
        res.send(204);
    }
});




// videos
app.get('/myvideos/users/:userId/videos', function (req, res) {
    console.log('GET /myvideos/user/' + req.params.userId + '/videos');
    var userId = req.params.userId;
    //res.send('hay query'+req.query.q);
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        var videos = [];
        //for (var id in db[userId].videos) videos.push(db[userId].videos[id]);
        //res.send(videos);
        if (req.query.q) {
            var query = req.query.q;
            var regexp = new RegExp(req.query.q);


            //res.send(typeof(db[userId].videos));
            array_videos = Object.entries(db[userId].videos);
            /* OK 
            _videos = array_videos.map(
                function(video) { 
                    return video; 
                }
            );
            */
            /*
            let _videos = array_videos.filter((video) => {
                return video.title.indexOf(req.query.q) !== -1;
            }).map((video) => this.clone(video));
            res.send(_videos);
            */

            _videos = array_videos.filter((video) => {
                _txt_v = "dentro aqui";
                //return _txt_v;
                return video.title.indexOf(req.query.q) !== -1;
            });
            res.send(_videos);

            /*
            _videos = db[userId].videos.filter((contact) => {
for (var att in contact) {
if (regexp.test(contact[att])) return true;
}
return false;
});
*/


            /*
            var _videos = db[userId].videos.filter((video) => {
                var _txt="hola estoy en fillter";
                return  _txt;
            });
            */

            /*            
            let _videos = db[userId].videos.filter((video) => {
                return video.title.indexOf(query) !== -1;
              }).map((video) => this.clone(video));
              res.send(_videos);
             //resolve(_videos);
            */
        } else {
            for (var id in db[userId].videos) videos.push(db[userId].videos[id]);
            res.send(videos);

        }

    }
});




/**
  findVideos(query: string): Promise<Video[]> {
    console.log(`[MemoryVideosService] findVideos(${query})`);
    return new Promise((resolve, reject) => {
      let _videos = this.videos.filter((video) => {
        return video.title.indexOf(query) !== -1;
      }).map((video) => this.clone(video));
      resolve(_videos);
    });
  } 
 * 
*/
/*
app.get('/mycontacts/users/:userId/contacts', function (req, res) {
    console.log('GET /mycontacts/users/' + req.params.userId + '/contacts');
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        var contacts = db[userId].contacts;
        if (req.query.q) {
            var regexp = new RegExp(req.query.q);
            contacts = db[userId].contacts.filter((contact) => {
                for (var att in contact) {
                    if (regexp.test(contact[att])) return true;
                }
                return false;
            });
        }
        res.send(contacts);
    }
});
*/



app.post('/myvideos/users/:userId/videos', function (req, res) {
    console.log('POST /myvideos/user/' + req.params.userId + '/videos');
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!req.body.type || !req.body.url || !req.body.title)
        res.send(400, 'Missing data');
    else {
        var video = {
            id: String(Date.now()), type: req.body.type,
            url: req.body.url, title: req.body.title, date: Date.now()
        };
        if (req.body.description) video.description = req.body.description;
        if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
        if (req.body.tags) video.tags = req.body.tags;
        if (req.body.width) video.width = req.body.width;
        if (req.body.height) video.height = req.body.height;
        db[userId].videos[video.id] = video;        
        res.send(video);
    }
});

app.get('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].videos[videoId]) res.send(404, 'Video not found');
    else res.send(db[userId].videos[index]);
});

app.put('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].videos[videoId]) res.send(404, 'Video not found');
    else {
        if (req.body.type) db[userId].videos[videoId].type = req.body.type;
        if (req.body.url) db[userId].videos[videoId].url = req.body.url;
        if (req.body.title) db[userId].videos[videoId].title = req.body.title;
        if (req.body.description)
            db[userId].videos[videoId].description = req.body.description;
        if (req.body.thumbnail)
            db[userId].videos[videoId].thumbnail = req.body.thumbnail;
        if (req.body.tags) db[userId].videos[videoId].tags = req.body.tags;
        if (req.body.width) db[userId].videos[videoId].width = req.body.width;
        if (req.body.height) db[userId].videos[videoId].height = req.body.height;
        res.send(db[userId].videos[videoId]);
    }
});


app.delete('/myvideos/users/:userId/videos/:videoId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId);
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].videos[videoId]) res.send(404, 'Video not found');
    else {
        delete db[userId].videos[videoId];
        res.send(204);
    }
});


// ********************* *****************/
// playlists
// ********************* *****************/
app.get('/myvideos/users/:userId/playlists', function (req, res) {
    console.log('GET /myvideos/user/' + req.params.userId + '/playlists');
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else {
        var playlists = [];
        for (var id in db[userId].playlists) {
            var playlist = {
                id: db[userId].playlists[id].id,
                title: db[userId].playlists[id].title,
                description: db[userId].playlists[id].description,
                date: db[userId].playlists[id].date
            };
           
            if (db[userId].playlists[id].thumbnail)
                playlist.thumbnail = db[userId].playlists[id].thumbnail;
                playlist.count = Object.keys(db[userId].playlists[id].idVideos).length;
                playlists.push(playlist);
            
        }
        res.send(playlists);
    }
});


app.post('/myvideos/users/:userId/playlists', function (req, res) {
    console.log('POST /myvideos/user/' + req.params.userId + '/playlists');
    console.log(req);
    var userId = req.params.userId;
    if (!userId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!req.body.title || !req.body.description)
        res.send(400, 'Missing data');
    else {
        var playlist = {
            id: String(Date.now()), title: req.body.title,
            description: req.body.description, 
            date: Date.now(), 
            idVideos: {}
        };
        if (req.body.thumbnail) playlist.thumbnail = req.body.thumbnail;
        db[userId].playlists[playlist.id] = playlist;
        var ret = {
            id: playlist.id, title: playlist.title,
            description: playlist.description, date: playlist.date
        };
        if (playlist.thumbnail) ret.thumbnail = playlist.thumbnail;
        res.send(ret);
    }
});

/** identificar esta api */
app.get('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else {
        var playlist = {
            id: db[userId].playlists[playlistId].id,
            title: db[userId].playlists[playlistId].title,
            description: db[userId].playlists[playlistId].description,
            date: db[userId].playlists[playlistId].date
        };
        if (db[userId].playlists[playlistId].thumbnail)
            playlist.thumbnail = db[userId].playlists[playlistId].thumbnail;
        res.send(playlist);
    }
});

app.put('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('PUT /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else {
        if (req.body.title) db[userId].playlists[playlistId].title = req.body.title;
        if (req.body.description)
            db[userId].playlists[playlistId].description = req.body.description;
        if (req.body.thumbnail)
            db[userId].playlists[playlistId].thumbnail = req.body.thumbnail;
        var playlist = {
            id: db[userId].playlists[playlistId].id,
            title: db[userId].playlists[playlistId].title,
            description: db[userId].playlists[playlistId].description,
            date: db[userId].playlists[playlistId].date
        };
        if (db[userId].playlists[playlistId].thumbnail)
            playlist.thumbnail = db[userId].playlists[playlistId].thumbnail;
        res.send(playlist);
    }
});


app.delete('/myvideos/users/:userId/playlists/:playlistId', function (req, res) {
    console.log('DELETE /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else {
        delete db[userId].playlists[playlistId];
        res.send(204);
    }
});

app.post('/myvideos/users/:userId/playlists/:playlistId/videos', function (req,  res) {
    console.log('POST /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!req.body.id || !req.body.type) res.send(400, 'Missing data');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else {
        db[userId].playlists[playlistId].idVideos[req.body.id] = {
            id: req.body.id,
            type: req.body.type
        };
        res.send(204);
    }
});


/** ojo la modificamos nosotros */
app.get('/myvideos/users/:userId/playlists/:playlistId/videos', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' +
        req.params.playlistId + '/videos');
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    if (!userId || !playlistId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else {
        var videos = [];
        for (var id in db[userId].playlists[playlistId].idVideos) {
            if (db[userId].playlists[playlistId].idVideos[id].type === 'local'){       
                videos.push(db[userId].videos[id]);
            }
            else {
                videos.push(db[userId].playlists[playlistId].idVideos[id]);
                //res.send(db[userId].playlists[playlistId].idVideos[id]);
            }
        }
        res.send(videos);
    }
});



app.delete('/myvideos/users/:userId/playlists/:playlistId/videos/:videoId', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/playlists/' + req.params.playlistId + '/videos/' + req.params.videoId);
    var userId = req.params.userId;
    var playlistId = req.params.playlistId;
    var videoId = req.params.videoId;
    if (!userId || !playlistId || !videoId) res.send(400, 'Missing parameter');
    else if (!db[userId]) res.send(404, 'User not found');
    else if (!db[userId].playlists[playlistId])
        res.send(404, 'Playlist not found');
    else if (!db[userId].playlists[playlistId].idVideos[videoId])
        res.send(404, 'Video not found');
    else {
        delete db[userId].playlists[playlistId].idVideos[videoId];
        res.send(204);
    }
});

////////////////////////
app.listen(8087);
console.log('HTTP server running');