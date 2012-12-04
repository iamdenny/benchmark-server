
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index'
    , { 
        title: 'Benchmark-Server' 
        , sHostname : req.headers.host
    }
  );
};