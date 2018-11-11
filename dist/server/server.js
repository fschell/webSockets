"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url_1 = require("url");
const app = express();
//initialize a simple http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({
    verifyClient: (info, done) => {
        console.log('Parsing session from request...', info.req.url);
        done(true);
    },
    server
});
const myClients = {};
wss.on('connection', (ws, req) => {
    // add wmsId to socket info - so we can use wss.clients.forEach
    const query = url_1.parse(req.url, true).query;
    ws.wmsId = query.id;
    // alternatively, to make it faster, store socket in own entities
    myClients[query.id] = ws;
    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        //log the received message and send it back to the client
        console.log('received: %s', message, ws.wmsId);
        ws.send(`Hello ${ws.wmsId}, you sent -> ${message}`);
    });
    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server, your id is:' + ws.wmsId);
    // log all clients
    wss.clients.forEach((client) => console.log(`client :`, client.wmsId));
    // simulate status change for id 125
    let i = 0;
    setInterval(() => {
        // direct access via entities
        if (!myClients['125']) {
            return;
        }
        myClients['125'].send(`Hello ${ws.wmsId}, something has changed ${++i}`);
        // alternative - slower because we have too loop over all socket clients
        // wss.clients.forEach((client: MyWebSocket) => {
        //         if (client.wmsId === '125') {
        //             client.send(`Hello ${ws.wmsId}, something has changed ${++i}`);
        //         }
        //     })
    }, 2000);
});
//start our server
server.listen(process.env.PORT || 8999, () => {
    const { port } = server.address();
    console.log(`Server started on port ${port} :)`);
});
//# sourceMappingURL=server.js.map