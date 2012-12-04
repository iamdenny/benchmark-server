/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , os = require('os')
  , Fs = require('fs')
  , Exec = require('child_process').exec;

var app = express();

exports.listen = function(nPort){
    app.configure(function(){
        app.set('port', nPort || 15030);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });
    
    app.configure('development', function(){
        app.use(express.errorHandler());
    });

    app.get('/', routes.index);    
    
    var oHttp = http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
    
    var SocketIo = require('socket.io');
    oSocketIo = SocketIo.listen(oHttp);
    
    oSocketIo.set('log level', 1);
    
    oSocketIo.sockets.on('connection', function(oSocket){
        console.log('connection');
        oSocket.emit('pushServerInfo', getServerInfo());
    
    
        setInterval(function(){
            readStat(function(data){
                var aTempData = data.split('\n')[4];
                // console.log(aTempData);
                var aData = aTempData.split('    ');
                // console.log(aData);
                var nUser = Number(aData[3], 10);
                var nSystem = Number(aData[5], 10);
                var nNice = Number(aData[4], 10);
                var nIdle = Number(aData[8], 10);
                
                var nTotalCpu = nUser + nSystem + nNice + nIdle,
                    nUserCpuUsage = Math.round(nUser / nTotalCpu * 100 * 100) / 100,
                    nSystemCpuUsage = Math.round(nSystem / nTotalCpu * 100 * 100) / 100,
                    nIdleCpuUsage = Math.round(nIdle / nTotalCpu * 100 * 100) / 100;
                    //console.log('nUser : ' + nUser + ', nSystem : ' + nSystem + ', nNice : ' + nNice + ', nIdle : ' + nIdle);
                
                var nFreeMemory = Math.round(os.freemem()/1000000 * 100) / 100,
                    nUsedMemory = Math.round((os.totalmem() - os.freemem()) / 1000000 * 100) / 100,
                    nTotalMemory = Math.round(os.totalmem()/1000000 * 100) / 100,
                    nMemoryUsage = Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100 * 100) / 100;
                
                oSocket.emit('pushMonitoringData', {
                    nFreeMemory : nFreeMemory, // MB
                    nUsedMemory : nUsedMemory,
                    nTotalMemory : nTotalMemory,
                    nMemoryUsage : nMemoryUsage,    
                    nUserCpuUsage : nUserCpuUsage,
                    nSystemCpuUsage : nSystemCpuUsage,
                    nIdleCpuUsage : nIdleCpuUsage,
                    nLoadAverage : os.loadavg()[0]
                });
            });
        }, 1000);  
    });
}

function getServerInfo(){
    var info = {};
    try { info['Hostname'] = os.hostname() } catch(err) { console.error(err) } 
    try { info['OS type'] = os.type() } catch(err) { console.error(err) } 
    try { info['Platform'] = os.platform() } catch(err) { console.error(err) } 
    try { info['Total memory (MB)'] = os.totalmem() / 1000000 } catch(err) { console.error(err) } 
    try { var cpus = os.cpus(); info['CPU'] = {architecture: os.arch(), model: cpus[0].model, speed: cpus[0].speed, cores: cpus.length} } catch(err) { console.error(err) } 
    try { info['Interfaces'] = os.networkInterfaces() } catch(err) { console.error(err) } 
    try { info['OS uptime (Hours)'] = Math.floor(os.uptime() / 3600) } catch(err) { console.error(err) } 
    try { info['Node arguments'] = process.argv } catch(err) { console.error(err) } 
    try { info['Node PID'] = process.pid; } catch(err) { console.error(err) } 
    try { info['Node uptime (Hours)'] = Math.floor(process.uptime() / 3600); } catch(err) { console.error(err) } 
    try { info['Node versions'] = process.versions } catch(err) { console.error(err) } 
    return info;
}


function readStat(fCallback){
    Exec('sar 1 1', function(err, stdout, stderr){
        fCallback(stdout.toString());
        if(err){
            console.error(err);
        }
        if(stderr){
            console.error(stderr);
        }
    });
}

//exports.listen(process.env.C9_PORT);