# Benchmark-Server
================

It's show up the status of the server such as cpu, mem and load average's usage per second, and provide you can check TPS(tranjaction per second)

## How to Install

NPM
```bash
npm install benchmark-server
```

GIT
```bash
git clone https://github.com/iamdenny/benchmark-server.git
```

## How to use

The port number shouldn't be same as the other HTTP which is your web server. Because It utilize express.js. It can be conflict.

```js
var BenchmarkServer = require('benchmark-server');
BenchmarkServer.listen(15030);
```

## Output

http://your-host:15030

## Preview
![preview](https://github.com/iamdenny/benchmark-server/raw/master/images/benchmark.jpg)