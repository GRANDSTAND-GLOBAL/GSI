require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const express = require("express");
const app = express();
const port = process.env.PORT;
var path = require('path');
const twilio = require("twilio");
const { create } = require("domain");
var displayName;
var eventID;
var identity;
var userType;
var token;
var userName;

// use the Express JSON middleware
app.use(express.json());

// create the twilioClient
const twilioClient = require("twilio")(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

app.get('/', (req, res, next) => {
    displayName = req.query.displayName;
    eventID = req.query.eventID;
    identity = req.query.identity;
    userType = req.query.userType;
    userName = eventID;
    token = getAccessToken(userName);

    app.get("/usr", async (req, res, next) => {
      res.send ( { 
        eventID: eventID,
        displayName: displayName,
        identity: identity,
        userType: userType,
        token: token,
        apiSecret : process.env.TWILIO_API_KEY_SECRET,
        accountSid : process.env.TWILIO_ACCOUNT_SID,
        apiKey : process.env.TWILIO_API_KEY_SID
      });
      return eventID;
      next();
    })

    if ( userType === "Host" ) {
//      findOrCreateRoom(userName);
        createRoom(eventID);
      console.log("Host name is: ", displayName, " for ", userName)
    } else {
//        findOrCreateRoom(userName);
          joinRoom(eventID);
        console.log("Attendee name is: ", displayName, " for ", userName)
      }
      next();
    })

      app.use(express.static(__dirname + '/'));
      app.get('/', function(req, res){
        res.sendFile('index.html', {root: path.join(__dirname, '/')})
    })
  
    const getAccessToken = (roomName) => {
    // create an access token
      const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
//        { identity: identity }
                { identity: uuidv4() }  // generate a random unique identity for this participant
      );
      const videoGrant = new VideoGrant({
          room: roomName,
        });
      token.addGrant(videoGrant);
      return token.toJwt();
    };

    const createRoom = async(eventID) => {
        twilioClient.video.rooms.create({
          uniqueName: eventID,
          type: "group",
        })
    }

      const joinRoom = async(eventID) => {
        twilioClient.video.rooms(eventID)
        .fetch()
        .then(room => console.log('here is join room ', room.uniqueName))
      }

app.listen(port, () => {
  console.log(`Grandstand: listening on port ${port}`);
});