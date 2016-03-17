var net = require('net');
var qtdatastream = require('qtdatastream');
var util = require('util');
var QtSocket = qtdatastream.Socket;
var program = require('commander');

var printableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()*+,./:;<=>?@[] ^_`{|}~-";
var printableCharcodes = [];
for (var i=0; i<printableChars.length; i++) {
    printableCharcodes.push(printableChars.charCodeAt(i));
}
 
program
  .version('1.0.0')
  .option('--quasselhost [quasselhost]', 'Quasselcore host (default: localhost)')
  .option('--quasselport [quasselport]', 'Quasselcore port (default: 4242)')
  .option('-p, --port [port]', 'Port on which the application listens (default: 64242)')
  .parse(process.argv);

if (program.quasselhost === undefined) program.quasselhost = 'localhost';
if (program.quasselport === undefined) program.quasselport = 4242;
if (program.port === undefined) program.port = 64242;

Buffer.prototype.inspect = function() {
    var isPrintable = true, ret = '<Buffer ', j=30, raw = [];
    //return qtdatastream.util.str(this);
    for (var value of this.values()) {
        if (printableCharcodes.indexOf(value) === -1) {
            isPrintable = false;
        }
        raw.push(value.toString(16));
        if (j-- < 0) break;
    }
    ret += 'len:' + this.length;
    if (isPrintable) {
        ret += '|str:' + qtdatastream.util.str(this);
    }
    ret += '|raw:' + raw.join(' ');
    if (this.length > 30) {
        ret += '...';
    }
    ret += '>';
    
    return ret;
};

var server = net.createServer((clientSocket) => {
    var socket = net.connect(program.quasselport, program.quasselhost);
    var quasselSocket = null;
    var quasselSocketClient = null;

    clientSocket.once('data', (buff) => {
        quasselSocketClient = new QtSocket(clientSocket);
        
        // Disables encryption and compression
        var buff2 = new Buffer([0x42, 0xb3, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x01, 0x80, 0x00, 0x00, 0x00]);
        console.log('<-', buff, 'replaced by', buff2);
        socket.write(buff2);
        
        quasselSocketClient.once('data', (data) => {
            data["UseCompression"] = 0;
            data["UseSsl"] = 0;
            quasselSocket.write(data);
            
            clientSocket.on('data', (buff3) => {
                console.log('<-', buff3);
                socket.write(buff3);
            });
        });
    })
    .on('end', (buff) => {
        console.log('client socket closed');
        socket.end();
        socket.destroy();
    });
    
    socket.once('data', function(data) {
        //var ret = data.readUInt32BE(0);
        quasselSocket = new QtSocket(socket);
        
        /*quasselSocket.on('data', (buff) => {
            console.log('=>', util.inspect(buff, { depth: null, colors: true }));
        });*/
        
        // Disables encryption and compression
        var buff2 = new Buffer([0x00, 0x00, 0x00, 0x01]);
        console.log('->', data, 'replaced by', buff2);
        clientSocket.write(buff2);
        
        socket.on('data', (buff) => {
            console.log('->', buff);
            clientSocket.write(buff);
        });
    });
})
.on('error', (err) => {
    console.log(err);
    throw err;
}).on('listening', () => {
    console.log('Listening on port', program.port);
});

qtdatastream.registerUserType("NetworkId", qtdatastream.Types.INT);
qtdatastream.registerUserType("IdentityId", qtdatastream.Types.INT);
qtdatastream.registerUserType("BufferId", qtdatastream.Types.INT);
qtdatastream.registerUserType("MsgId", qtdatastream.Types.INT);
qtdatastream.registerUserType("Identity", qtdatastream.Types.MAP);
qtdatastream.registerUserType("NetworkInfo", qtdatastream.Types.MAP);
qtdatastream.registerUserType("Network::Server", qtdatastream.Types.MAP);
qtdatastream.registerUserType("NetworkId", qtdatastream.Types.INT);
qtdatastream.registerUserType("BufferInfo", [
    {id: qtdatastream.Types.INT},
    {network: qtdatastream.Types.INT},
    {type: qtdatastream.Types.SHORT},
    {group: qtdatastream.Types.INT},
    {name: qtdatastream.Types.BYTEARRAY}
]);
qtdatastream.registerUserType("Message", [
    {id: qtdatastream.Types.INT},
    {timestamp: qtdatastream.Types.UINT},
    {type: qtdatastream.Types.UINT},
    {flags: qtdatastream.Types.BOOL},
    {bufferInfo: "BufferInfo"},
    {sender: qtdatastream.Types.BYTEARRAY},
    {content: qtdatastream.Types.BYTEARRAY}
]);

server.listen(program.port);