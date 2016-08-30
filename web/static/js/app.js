import "phoenix_html"
import socket from "./socket"
import {Presence} from "phoenix"
import Peer from "simple-peer"
import getUserMedia from "getusermedia"

// Now that you are connected, you can join channels with a topic:
let channel;
let updateStatus = (status) => {
  let myVideo = document.getElementById('status')
  myVideo.textContent = status
}
updateStatus("Waiting for another User")
let joinChannel = () => {
  if(!Peer.WEBRTC_SUPPORT) {
    updateStatus("Sorry your browser is not supported, please use Chrome or Firefox")
    return
  }

  channel = socket.channel("users:lobby", {})
  channel.join()
    .receive("ok", resp => { console.log("Joined users successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  channel.on(`chat_start`, payload => {
    if(payload.users.includes(window.user_id)) {
      updateStatus("Another user found, connecting...")
      let otherUser = payload.users.filter((id) => window.user_id != id)[0]
      channel.leave()
      channel = null
      let callChannel = socket.channel(payload.room)
      callChannel.join()
        .receive("ok", resp => { console.log("Joined  callChannel successfully", resp) })
        .receive("error", resp => { console.log("Unable to join", resp) })

      getUserMedia({video: true, audio: true}, (err, stream) => {
        if(err) {
          updateStatus("There was a problem with your WebCam/Microphone. Please check your settings and try again.")
          joinChannel();
          return
        }

        let myVideo = document.getElementById('my-video')
        let video = document.getElementById('caller-video')
        let vendorURL = window.URL || window.webkitURL
        myVideo.src = vendorURL ? vendorURL.createObjectURL(stream) : stream
        myVideo.muted = true
        myVideo.play()

        var peer = new Peer({ initiator: payload.initiator == window.user_id, trickle: true, stream: stream, config: {iceServers: [{urls:'stun:stun.l.google.com:19302'}, {urls:'stun:stun1.l.google.com:19302'}, {urls:'stun:stun2.l.google.com:19302'}, {urls:'stun:stun3.l.google.com:19302'}, {urls:'stun:stun4.l.google.com:19302'}]}})

        peer.on('error', err => {
          try {
            callChannel.leave()
            callChannel = null
            peer = null
            myVideo.removeAttribute("src");
            myVideo.load();
            video.removeAttribute("src");
            video.load();
            updateStatus("User lost waiting for another")
            peer.destroy()
            joinChannel()
          } catch(err) {
            //Ignore
          }
        })

        peer.on('close', () => {
          try {

            callChannel.leave()
            callChannel = null
            peer = null
            myVideo.removeAttribute("src");
            myVideo.load();
            video.removeAttribute("src");
            video.load();

            video.src = null
            updateStatus("User lost waiting for another")
            joinChannel()
          } catch(err) {
            //Ignore
          }
        })

        peer.on('signal', signal => { callChannel.push('signal', signal) })
        callChannel.on(`signal:${otherUser}`, signal => { peer.signal(signal) })
        peer.on('connect', () => console.log("CONNECT"))
        peer.on('stream', (callerStream) => {
          // got remote video stream, now let's show it in a video tag
          video = document.getElementById('caller-video')
          video.src = vendorURL ? vendorURL.createObjectURL(callerStream) : callerStream
          video.play()
          updateStatus("Video Streaming")
        })
      })


    }
  })
}

joinChannel();
