import { rtdb } from './firebaseClient';
import { ref, push, onChildAdded, onValue, onDisconnect, remove, off, set } from 'firebase/database';

export class WebRTCManager {
  pc: RTCPeerConnection | null = null;
  roomId: string;
  userId: string;
  stream: MediaStream | null = null;
  presenceUnsubscribe: (() => void) | null = null;
  signalsUnsubscribe: (() => void) | null = null;
  signalQueue: any[] = [];
  signalTimeout: any = null;
  
  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  async init(isInitiator: boolean, onStream: (stream: MediaStream) => void) {
    console.log(`[WebRTC] Initializing native RTCPeerConnection (Initiator: ${isInitiator}) for room: ${this.roomId}`);
    try {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        console.log('[WebRTC] Media stream acquired successfully');
      } catch (mediaErr) {
        console.error('[WebRTC] Media access denied:', mediaErr);
        throw new Error('Microphone access denied or unavailable. Please allow microphone access.');
      }

      const roomRefStr = `rooms/${this.roomId}`;
      const signalsRef = ref(rtdb, `${roomRefStr}/signals`);
      const myPresenceRef = ref(rtdb, `${roomRefStr}/presence/${this.userId}`);
      const presenceRef = ref(rtdb, `${roomRefStr}/presence`);

      onDisconnect(myPresenceRef).remove().catch(e => console.error('onDisconnect error', e));
      await set(myPresenceRef, true);

      let peerStarted = false;

      const flushQueue = async () => {
          if (this.signalQueue.length === 0) return;
          const toSend = [...this.signalQueue];
          this.signalQueue = [];
          
          console.log(`[WebRTC] Broadcasting batch of ${toSend.length} signals`);
          await push(signalsRef, {
              from: this.userId,
              signals: toSend
          });
      }

      const queueSignal = (sig: any) => {
          this.signalQueue.push(sig);
          if (!this.signalTimeout) {
              this.signalTimeout = setTimeout(() => {
                  this.signalTimeout = null;
                  flushQueue();
              }, 150);
          }
      };

      const startPeer = async () => {
        if (peerStarted) return;
        peerStarted = true;
        
        console.log('[WebRTC] Fetching TURN credentials...');
        let iceServers: RTCIceServer[] = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ];
        
        try {
            const response = await fetch("https://chatjeen.metered.live/api/v1/turn/credentials?apiKey=3d6521bf1c978d7d05097c2693d33ef8c6ae");
            const meteredServers = await response.json();
            if (Array.isArray(meteredServers)) {
                iceServers = [...meteredServers, ...iceServers];
            }
        } catch (e) {
            console.error('[WebRTC] Failed to fetch TURN credentials, falling back to STUN only', e);
        }

        console.log('[WebRTC] Creating RTCPeerConnection with', iceServers.length, 'servers');
        
        this.pc = new RTCPeerConnection({
          iceServers: iceServers
        });

        // Add local tracks
        this.stream!.getTracks().forEach(track => {
            this.pc!.addTrack(track, this.stream!);
        });

        // Handle incoming remote stream
        this.pc.ontrack = (event) => {
            console.log('[WebRTC] Received remote track');
            if (event.streams && event.streams[0]) {
                onStream(event.streams[0]);
            } else {
                const inboundStream = new MediaStream([event.track]);
                onStream(inboundStream);
            }
        };

        // Handle outgoing ICE candidates
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('[WebRTC] Generated ICE candidate, queueing...');
                queueSignal({ type: 'candidate', candidate: event.candidate });
            }
        };

        this.pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE state change:', this.pc?.iceConnectionState);
        };
        
        this.pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Peer state change:', this.pc?.connectionState);
        };

        if (isInitiator) {
            console.log('[WebRTC] Creating local SDP Offer');
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            queueSignal({ type: offer.type, sdp: offer.sdp });
        }
      };

      // Handle receiving signaling data from partner
      const processIncomingSignal = async (sig: any) => {
          if (!peerStarted && !isInitiator) {
              console.log('[WebRTC] Starting peer natively upon receiving signal failsafe');
              await startPeer();
          }
          if (!this.pc) return;

          try {
              if (sig.type === 'offer') {
                  console.log('[WebRTC] Handling remote SDP Offer');
                  await this.pc.setRemoteDescription(new RTCSessionDescription(sig));
                  const answer = await this.pc.createAnswer();
                  await this.pc.setLocalDescription(answer);
                  console.log('[WebRTC] Sending SDP Answer');
                  queueSignal({ type: answer.type, sdp: answer.sdp });
              } else if (sig.type === 'answer') {
                  console.log('[WebRTC] Handling remote SDP Answer');
                  await this.pc.setRemoteDescription(new RTCSessionDescription(sig));
              } else if (sig.type === 'candidate' && sig.candidate) {
                  console.log('[WebRTC] Handling remote ICE Candidate');
                  await this.pc.addIceCandidate(new RTCIceCandidate(sig.candidate));
              }
          } catch (e) {
              console.error('[WebRTC] Failed to process incoming signal:', e, sig);
          }
      };

      // Listen for batched signals from Firebase
      const onSignalAdded = onChildAdded(signalsRef, async (snapshot) => {
        const payload = snapshot.val();
        if (payload && payload.from !== this.userId && payload.signals) {
          console.log(`[WebRTC] Received batch of ${payload.signals.length} signals from peer`);
          // CRITICAL FIX: Must process signals strictly sequentially, otherwise 
          // ICE candidates might be added before setRemoteDescription(offer) finishes!
          for (const sig of payload.signals) {
              await processIncomingSignal(sig);
          }
        }
      });
      this.signalsUnsubscribe = () => off(signalsRef, 'child_added', onSignalAdded);

      // Track presence
      const onPresenceUpdate = onValue(presenceRef, (snapshot) => {
          const state = snapshot.val() || {};
          const presentUsers = Object.keys(state);
          console.log('[WebRTC] Presence Sync. Users in room:', presentUsers.length);
          
          if (presentUsers.length >= 2 && !peerStarted) {
             console.log('[WebRTC] Presence confirms both users ready.');
             startPeer();
          }
      });
      this.presenceUnsubscribe = () => off(presenceRef, 'value', onPresenceUpdate);

      // Timeout Failsafe
      setTimeout(() => {
          if (isInitiator && !peerStarted) {
              console.log('[WebRTC] Failsafe: Initiator starting timeout...');
              startPeer();
          }
      }, 5000);

    } catch (err) {
      console.error('[WebRTC] Init Error:', err);
      throw err;
    }
  }

  async destroy() {
    console.log('[WebRTC] Destroying connection and cleaning up tracks');
    if (this.pc) {
        this.pc.close();
        this.pc = null;
    }
    this.stream?.getTracks().forEach(track => track.stop());
    
    if (this.presenceUnsubscribe) this.presenceUnsubscribe();
    if (this.signalsUnsubscribe) this.signalsUnsubscribe();

    try {
        const myPresenceRef = ref(rtdb, `rooms/${this.roomId}/presence/${this.userId}`);
        await remove(myPresenceRef);
        onDisconnect(myPresenceRef).cancel();
    } catch(e) {
        console.error('Cleanup error', e);
    }
  }
}
