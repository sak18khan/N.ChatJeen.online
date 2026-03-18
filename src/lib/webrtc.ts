export class PeerJSManager {
  peer: any = null;
  currentCall: any = null;
  roomId: string;
  userId: string;
  stream: MediaStream | null = null;
  callRetryInterval: any = null;
  
  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  async init(isInitiator: boolean, partnerId: string | null, onStream: (stream: MediaStream) => void, onError: (msg: string) => void) {
    console.log(`[PeerJS] Initializing (Initiator: ${isInitiator}) for room: ${this.roomId}`);
    try {
      try {
          this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          console.log('[PeerJS] Media stream acquired successfully');
      } catch (mediaErr) {
          console.error('[PeerJS] Media access denied:', mediaErr);
          onError('Microphone access denied or unavailable. Please allow microphone access.');
          return;
      }

      const { Peer } = await import('peerjs');

      // Deterministic IDs so peers can find each other across the public cloud without a dedicated signaling DB
      const myPeerId = `${this.roomId}-${isInitiator ? 'initiator' : 'receiver'}`;
      const partnerPeerId = `${this.roomId}-${!isInitiator ? 'initiator' : 'receiver'}`;

      let iceServers: RTCIceServer[] = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
      ];

      try {
          // Keep the robust TURN servers we fetched previously!
          const response = await fetch("https://chatjeen.metered.live/api/v1/turn/credentials?apiKey=3d6521bf1c978d7d05097c2693d33ef8c6ae");
          const meteredServers = await response.json();
          if (Array.isArray(meteredServers)) {
              iceServers = [...meteredServers, ...iceServers];
          }
      } catch (e) {
          console.warn('[PeerJS] Failed to fetch TURN credentials, falling back to basic STUN', e);
      }

      console.log(`[PeerJS] Connecting to cloud with ID: ${myPeerId}`);
      
      this.peer = new Peer(myPeerId, {
          config: {
              iceServers: iceServers
          },
          debug: 2
      });

      this.peer.on('open', (id: string) => {
          console.log('[PeerJS] Connected to signaling server with ID:', id);
          
          if (isInitiator) {
              console.log('[PeerJS] Initiator ready. Will attempt to call partner continuously until they connect...');
              
              const attemptCall = () => {
                  if (this.currentCall && this.currentCall.open) {
                      clearInterval(this.callRetryInterval);
                      return;
                  }
                  console.log(`[PeerJS] Calling partner: ${partnerPeerId}`);
                  const call = this.peer.call(partnerPeerId, this.stream);
                  if (call) {
                      this.setupCall(call, onStream);
                  }
              };

              // Try immediately, then loop every 2.5s until the partner logs onto the PeerJS server
              attemptCall();
              this.callRetryInterval = setInterval(attemptCall, 2500);
          }
      });

      this.peer.on('call', (incomingCall: any) => {
          console.log('[PeerJS] Receiving incoming call!');
          if (this.currentCall) {
              console.log('[PeerJS] Closing stale call object to accept new one.');
              this.currentCall.close();
          }
          incomingCall.answer(this.stream);
          this.setupCall(incomingCall, onStream);
      });

      this.peer.on('error', (err: any) => {
          // 'peer-unavailable' is expected while the initiator loops. Don't throw errors for it.
          if (err.type !== 'peer-unavailable') {
              console.error('[PeerJS] Fatal Error:', err.type, err);
          }
      });

    } catch (err: any) {
      console.error('[PeerJS] Init Error:', err);
      onError(err.message || 'Voice connection failed to initialize.');
    }
  }

  setupCall(call: any, onStream: (stream: MediaStream) => void) {
      this.currentCall = call;
      
      call.on('stream', (remoteStream: MediaStream) => {
          console.log('[PeerJS] Remote stream received and bound!');
          if (this.callRetryInterval) {
              clearInterval(this.callRetryInterval);
              this.callRetryInterval = null;
          }
          onStream(remoteStream);
      });

      call.on('close', () => {
          console.log('[PeerJS] Call closed cleanly');
      });

      call.on('error', (err: any) => {
          console.error('[PeerJS] Active call error:', err);
      });
  }

  destroy() {
      console.log('[PeerJS] Destroying connection and cleaning up tracks...');
      if (this.callRetryInterval) clearInterval(this.callRetryInterval);
      if (this.currentCall) {
          this.currentCall.close();
          this.currentCall = null;
      }
      if (this.peer) {
          this.peer.destroy();
          this.peer = null;
      }
      if (this.stream) {
          this.stream.getTracks().forEach(track => {
              track.stop();
          });
          this.stream = null;
      }
  }
}
