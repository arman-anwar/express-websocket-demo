
const path = require('path');
const express = require('express');
const app = express();

const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server, path: "/livestream" });

const users = []


const getUniqueId = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4()
}

app.use(express.static(path.join(__dirname, 'public')))

wss.on('connection', function connection(ws, request, clientx) {

    let userId = getUniqueId()

    users.push({ userId, ws })

    console.log((new Date()) + ' Received a new client from origin ' + request.headers.origin)
    ws.send(JSON.stringify({ message: 'Welcome New client', "type": "connection" }));

    ws.on('message', function incoming(msg) {
        let message = JSON.parse(msg)
        console.log('received: %s', message);
        // ws.send('Got you message: ' + message);
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });

});

app.get('/', (req, res) => res.send('Hello world!!'));


server.listen(3000, () => console.log('Server listening on port 3000'));