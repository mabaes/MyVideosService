app.get('/myvideos/users/:userId/videos/:videoId/share', function (req, res) {
    console.log('GET /myvideos/users/' + req.params.userId + '/videos/' +
        req.params.videoId+'/share');
    var userId = req.params.userId;
    var videoId = req.params.videoId;
    console.log('video' + videoId);
    if (!userId || !videoId) res.send(400, 'Missing parameter');
    else {
        db.collection('users').findOne({ _id: ObjectID.createFromHexString(userId) }, (err, doc) => {
            if (err) res.send(500);
            else if (!doc) res.send(404, 'User not found');
            else {
                console.log('share video');
                ///////////////////////////////////////////////////////
                _videoAdd =  {
                    id :  ObjectID.createFromHexString(videoId),
                    isOwner : 0
                }
                    _errores = true;
                    db.collection('users').find({ _id:{$nin:[ObjectID.createFromHexString(userId)]} }).forEach(function(item){
                        //if (err) res.send(500, err);
                        //else {
                        console.log('dentro');
                        console.log(item);
                        console.log(item['_id']);
                        db.collection('users').update(
                            { _id: item['_id'] },
                            { $addToSet: { videos: _videoAdd } },
                            {multi:true},
                            (err, doc) => {
                                if (err) res.send(500, err);
                                else {
                                    console.log('no errores');
                                    _errores= false;
                                    //res.send(204);
                                }                               
                        });
                    //}
                        //if (err) res.send(500, err);
                        //else res.send (204);
                    })
                    /*
                    .error(function(err){
                        // handle error
                        console.log('errores');
                      })
                      .success(function(){
                        // final callback
                        console.log('todo bien');
                      });
                      */
                    //console.log('hay errores: '+_errores);
                    /*if(!_errores) {
                        res.send(204)
                    } else {
                        res.send (500, 'errores al compartir video');
                    }
                    */
                /*
                db.collection('users').find({ _id: { $nin: ObjectID.createFromHexString(userId)},
                }).forEach(function(item,err){
                    console.log(item);
                });
                */ 
                /*
                db.collection('users').update(
                    { },
                    { $addToSet: { videos: _videoAdd } },
                    {multi:true},
                    //{ $addToSet: { videos : result.insertedId } },
                    (err, doc) => {
                        if (err) res.send(500, err);
                        res.send(doc);
                    });
                    */
                ///////////////////////////////////////////////////////
            } //end else
        });
    }
});