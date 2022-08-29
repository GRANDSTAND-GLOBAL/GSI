  'use strict';
    const { createLocalTracks, createLocalVideoTrack, connect } = require('twilio-video');
    const fs = require("fs");
    const fsPromises = fs.promises;

    const Twilio = require('twilio');
 //   const Twilio = require('twilio-video');
    const { isSupported } = require('twilio-video');
//    const { isMobile } = require('./src/browser');
//    const micLevel = require('./src/miclevel');
//    const selectMedia = require('./src/selectmedia');
//    const selectRoom = require('./src/selectroom');
//    const showError = require('./src/showerror');

    const startButton = document.getElementById("btn-start");
    const endButton = document.getElementById("btn-end");
    const joinButton = document.getElementById("btn-join");
    const leaveButton = document.getElementById("btn-leave");
    const att = document.querySelector(".att");
    const host = document.querySelector(".host");
    const videoAtt = document.querySelector(".video-att");
    const videoHost = document.querySelector(".video-host");
    const ctrlHost = document.querySelector(".ctrl-host");
    const ctrlAtt = document.querySelector(".ctrl-att");
    const icons = document.querySelector(".icons");

    var displayName, eventID, identity, userType, token, jsonData, room;
    var videoTrack, apiKey, apiSecret, accountSid, userName, twilioClient;

      getUser().then ( async userData => {

          eventID = localStorage.getItem("eventID");
          displayName = localStorage.getItem("displayName");
          identity = localStorage.getItem("identity");
          userType = localStorage.getItem("userType");
          token = localStorage.getItem("token");
          apiSecret = localStorage.getItem("apiSecret");
          accountSid = localStorage.getItem("accountSid");
          apiKey = localStorage.getItem("apiKey");
          userName = eventID;
          console.log('host is', userType)
          if ( userType == "Host" ) {
//            host.style.display="flex";
            startButton.style.display = "block"; 
            endButton.style.display = "block";
          } else {
            host.style.display="none";
            joinButton.style.display = "block"; 
            leaveButton.style.display = "block";
          }
      });

    async function getUser() {
      const response = await fetch('./usr');
      const jsonData = await response.json().then ( response => {
        const eventID = response.eventID;
        const displayName = response.displayName;
        const identity = response.identity;
        const userType = response.userType;
        const token = response.token;
        const apiSecret = response.apiSecret;
        const apiKey = response.apiKey;
        const accountSid = response.accountSid;
        localStorage.setItem("eventID", eventID)
        localStorage.setItem('displayName', displayName)
        localStorage.setItem('identity', identity)
        localStorage.setItem('userType', userType)
        localStorage.setItem('token', token)
        localStorage.setItem('apiSecret', apiSecret)
        localStorage.setItem('accountSid', accountSid)
        localStorage.setItem('apiKey', apiKey)
      })
    }
    const startRoom = async (event) => {
//    preview screen
        createLocalVideoTrack({
            audio : true,
            video : 640,
            width: 640,
            height: 480
          }).then(videoTrack => {
              videoHost.appendChild(videoTrack.attach());
            });  return videoTrack;
        }

    startButton.onclick = async () => {
      console.log('start clicked')
        startButton.style.display = "none";
        startRoom();
        connect(token, { 
            audio: true,
            uniqueName: eventID,
            video: { width: 640,
                    height: 480 }
          })
          .then(room => {
              console.log(`Successfully joined a Room: ${room.name}`);
              const localParticipant = room.localParticipant;
              console.log(`Connected to the Room as LocalParticipant ${localParticipant.identity}`);
              console.log(`===============Connected as sid "${localParticipant.sid}"`);
          }), error => {
              console.log(`unable to connect: ${error.message}`)
          }
      }
    joinButton.onclick = async () => {
        joinButton.style.display = "none";
        room = await connect(token, { 
            audio: false,
            name: eventID,
            video: { width: 640,
                    height: 480 },
            tracks: videoTrack
          }).then(room => {
              console.log(`======= >>>>>> =======Successfully joined a Room: ${room.name}`);
              const localParticipant = room.localParticipant;
              console.log(`===============Connected room sid`, room.sid);
              console.log(`===============Connected participant sid "${localParticipant.sid}"`);

              room.participants.forEach(participant => {
                  participant.tracks.forEach(publication => {
                    if (publication.isSubscribed) {
                          videoAtt.appendChild(publication.track.attach());
                        } else {
                          publication.on('subscribed', track => {
                            videoAtt.appendChild(track.attach());
                            })
                        }
                    })
                })          
            }), error => {
                console.error(`unable to connect to room: ${error.message}`)
              };
        }

    endButton.onclick = () => {
      host.style.display = "none";
      att.style.display = "none";
      icons.style.display = "block";
      }

    leaveButton.onclick = () => {
      host.style.display = "none";
      att.style.display = "none";
      leaveButton.style.display = "none";
      videoAtt.style.display = "none";
      icons.style.display = "block";
      }
                
    function trackPublished(publication, participant) {
        console.log(`RemoteParticipant ${participant.sid} published Track ${publication.trackSid}`);
      }
