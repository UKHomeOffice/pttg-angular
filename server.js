var express = require('express');
var serveStatic = require('serve-static');
var http = require('http');
var app = express();
var _ = require('underscore');

app.use(serveStatic('dist/', { 'index': ['index.html'] }));
app.listen(3000, function () {
    console.log('The server is running on port 3000');
});

app.get('/pttg/financialstatusservice/v1/accounts/:sortCode/:accountNumber/dailybalancestatus', function(req, res) {
  var data = '';
  var url = '/pttg/financialstatusservice/v1/accounts/' + req.params.sortCode + '/' + req.params.accountNumber + '/dailybalancestatus?';
  _.each(req.query, function (v, k) {
    url += k + '=' + v + '&';
  });
    // res.send(url);
    // return;
  http.request({
    host: "127.0.0.1",
    port: 8001,
    path: url
  }, function(response) {
    // read the data response
    response.setEncoding("utf8");
    response.on("data", function (chunk) {
      data += chunk;
    });
    response.on("end", function () {
      // finished downloading, overview
      res.status(response.statusCode);
      res.send(data);
    });
  })
  .end();
});