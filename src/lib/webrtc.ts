import Peer from 'simple-peer';
import { supabase } from './supabaseClient';

export class WebRTCManager {
  peer: Peer.Instance | null = null;
  roomId: string;
  userId: string;
  stream: MediaStream | null = null;

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  async init(isInitiator: boolean, onStream: (stream: MediaStream) => void) {
    console.log(`[WebRTC] Initializing (Initiator: ${isInitiator}) for room: ${this.roomId}`);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('[WebRTC] Media stream acquired');

      this.peer = new Peer({
        initiator: isInitiator,
        trickle: false,
        stream: this.stream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
      });

      this.peer.on('signal', async (data) => {
        console.log('[WebRTC] Signal generated, broadcasting...', data.type);
        // Send signal via Supabase Realtime
        await supabase.channel(`room:${this.roomId}`).send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { signal: data, from: this.userId },
        });
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

      // Listen for signals
      supabase.channel(`room:${this.roomId}`).on('broadcast', { event: 'webrtc-signal' }, ({ payload }) => {
        if (payload.from !== this.userId && this.peer) {
          console.log('[WebRTC] Received signal from peer:', payload.signal.type);
          try {
              this.peer.signal(payload.signal);
          } catch (e) {
              console.error('[WebRTC] Failed to process received signal:', e);
          }
        }
      }).subscribe((status) => {
          console.log(`[WebRTC] Signaling channel status: ${status}`);
      });

    } catch (err) {
      console.error('[WebRTC] Init Error:', err);
    }
  }

  destroy() {
    this.peer?.destroy();
    this.stream?.getTracks().forEach(track => track.stop());
  }
}
