import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {parse} from 'url';
import {AddressInfo} from "net";

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server( {
    verifyClient: (info, done) => {
        console.log('Parsing session from request...', info.req.url);
        done(true);
    }
    , server });

// only needed if we want to add a property
interface MyWebSocket extends WebSocket {
    wmsId?: string;
}

type Entities<T> = { [key: string]: T | undefined };
const myClients: Entities<MyWebSocket> = {};

wss.on('connection', (ws: MyWebSocket, req: Request) => {

    // add wmsId to socket info - so we can use wss.clients.forEach
    const query = parse(req.url, true).query;
    ws.wmsId  = query.id as string;

    // alternatively, to make it faster, store socket in own entities
    myClients[query.id as string] = ws;

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message, ws.wmsId);
        ws.send(`Hello ${ws.wmsId}, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server, your id is:' + ws.wmsId);

    // log all clients
    wss.clients.forEach(
        (client: MyWebSocket) => console.log(`client :`, client.wmsId)
    );

    // simulate status change for id 125
    let i = 0;
    setInterval(() => {

        // direct access via entities
        if (!myClients['125']) {
            return;
        }
        myClients['125']!.send(`Hello ${ws.wmsId}, something has changed ${++i}`)

        // alternative - slower because we have too loop over all socket clients
        // wss.clients.forEach((client: MyWebSocket) => {
        //         if (client.wmsId === '125') {
        //             client.send(`Hello ${ws.wmsId}, something has changed ${++i}`);
        //         }
        //     })

    }, 2000)

});

//start our server
server.listen(process.env.PORT || 8999, () => {
    const { port } = server.address() as AddressInfo;
    console.log(`Server started on port ${port} :)`);
});