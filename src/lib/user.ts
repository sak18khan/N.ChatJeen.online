'use client';

import { v4 as uuidv4 } from 'uuid';

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    let id = localStorage.getItem('chatjeen_anon_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chatjeen_anon_id', id);
    }
    return id;
  } catch (err) {
    console.warn('localStorage is disabled. Falling back to temporary UUID.');
    return uuidv4();
  }
}
