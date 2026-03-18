import Peer from 'simple-peer';
import { rtdb } from './firebaseClient';
import { ref, push, onChildAdded, onValue, onDisconnect, remove, off, set } from 'firebase/database';

export class WebRTCManager {
  peer: Peer.Instance | null = null;
  roomId: string;
  userId: string;
  stream: MediaStream | null = null;
  presenceUnsubscribe: (() => void) | null = null;
  signalsUnsubscribe: (() => void) | null = null;
  
  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  async init(isInitiator: boolean, onStream: (stream: MediaStream) => void) {
    console.log(`[WebRTC] Initializing (Initiator: ${isInitiator}) for room: ${this.roomId}`);
    try {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        console.log('[WebRTC] Media stream acquired');
      } catch (mediaErr) {
        console.error('[WebRTC] Failed to get media stream:', mediaErr);
        throw new Error('Microphone access denied or unavailable. Please allow microphone access.');
      }

      const roomRefStr = `rooms/${this.roomId}`;
      const signalsRef = ref(rtdb, `${roomRefStr}/signals`);
      const myPresenceRef = ref(rtdb, `${roomRefStr}/presence/${this.userId}`);
      const presenceRef = ref(rtdb, `${roomRefStr}/presence`);

      // Setup disconnect hook to remove presence when client drops unexpectedly
      onDisconnect(myPresenceRef).remove().catch(e => console.error('onDisconnect error', e));
      // Set presence to true
      await set(myPresenceRef, true);

      let peerStarted = false;

      const startPeer = () => {
        if (peerStarted) return;
        peerStarted = true;
        
        console.log('[WebRTC] Both peers present. Starting Simple-Peer logic...');
        this.peer = new Peer({
          initiator: isInitiator,
          trickle: true,
          stream: this.stream as MediaStream,
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
        });

        // Batch signals to avoid excessive DB writes, though Firebase is very tolerant
        let signalQueue: any[] = [];
        let signalTimeout: any = null;

        const flushSignals = async () => {
          if (signalQueue.length === 0) return;
          const toSend = [...signalQueue];
          signalQueue = [];
          
          console.log(`[WebRTC] Broadcasting batch of ${toSend.length} signals via Firebase`);
          await push(signalsRef, {
            from: this.userId,
            signals: toSend
          });
        };

        this.peer.on('signal', (data) => {
          console.log('[WebRTC] Signal generated (' + (data.type || 'candidate') + '), queuing...');
          signalQueue.push(data);
          if (!signalTimeout) {
             signalTimeout = setTimeout(() => {
                 signalTimeout = null;
                 flushSignals();
             }, 100); // 100ms batch window is plenty fast and highly optimized
          }
        });

        this.peer.on('stream', (remoteStream) => {
          console.log('[WebRTC] Remote stream received!');
          onStream(remoteStream);
        });

        this.peer.on('error', (err) => {
          console.error('[WebRTC] Peer Error:', err);
        });

        this.peer.on('connect', () => {
          console.log('[WebRTC] P2P Connection Established');
        });
      };

      // Listen for batched signals from Firebase
      const onSignalAdded = onChildAdded(signalsRef, (snapshot) => {
        const payload = snapshot.val();
        if (payload && payload.from !== this.userId) {
          console.log(`[WebRTC] Received batch of ${payload.signals?.length} signals from peer`);
          
          // Failsafe: start peer if it hasn't started
          if (!peerStarted && !isInitiator) {
              console.log('[WebRTC] Failsafe: starting peer upon receiving signal');
              startPeer();
          }
          
          if (this.peer && payload.signals) {
            payload.signals.forEach((sig: any) => {
                try {
                    this.peer?.signal(sig);
                } catch (e) {
                    console.error('[WebRTC] Failed to process received signal:', e);
                }
            });
          }
        }
      });

      this.signalsUnsubscribe = () => off(signalsRef, 'child_added', onSignalAdded);

      // Track presence to guarantee both users are here before initiating connection
      const onPresenceUpdate = onValue(presenceRef, (snapshot) => {
          const state = snapshot.val() || {};
          const presentUsers = Object.keys(state);
          console.log('[WebRTC] Presence Sync. Users in room:', presentUsers.length);
          
          if (presentUsers.length >= 2 && !peerStarted) {
             console.log('[WebRTC] Presence confirms both users are connected to channel.');
             startPeer();
          }
      });

      this.presenceUnsubscribe = () => off(presenceRef, 'value', onPresenceUpdate);

      // Failsafe: If presence somehow drops out but we are the initiator, just try it after 5s
      setTimeout(() => {
          if (isInitiator && !peerStarted) {
              console.log('[WebRTC] Failsafe: Initiator starting peer after timeout...');
              startPeer();
          }
      }, 5000);

    } catch (err) {
      console.error('[WebRTC] Init Error:', err);
      throw err;
    }
  }

  async destroy() {
    this.peer?.destroy();
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
