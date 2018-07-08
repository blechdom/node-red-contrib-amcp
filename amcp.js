module.exports = function(RED) {
    "use strict";

    var telnet = require('telnet-client');

    function amcpOut(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        this.telnetPort = n.port || "5250";
        this.telnetHost = n.host || "localhost";
        
        this.on("input",function(msg) {
          
          var command = msg.payload;
          var connection = new telnet();
          var params = {
            host: this.telnetHost,
            port: this.telnetPort,
            timeout: 1500,
            negotiationMandatory: false,
            ors: '\r\n', 
            waitfor: '\n'  
          };
          connection.on('connect', function() {
              connection.send(command, function(err, res) {
                  if (err) return err

                  connection.send('', {
                      ors: '\r\n',
                      waitfor: '\n'
                  }, function(err, res) {
                    if (err) return err
                      console.log('resp after cmd:', res)
                  })
                  node.send({payload:res.trim()});  
              })
          })

          connection.connect(params)            
        });
        this.on('close', function(done) {
            connection.end();
            connection.on('close', function() {
                done();
                console.log('connection closed')
            })  
        });
    }
    RED.nodes.registerType("amcp", amcpOut);
}


