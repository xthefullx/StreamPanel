export interface M3UList {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'expired' | 'inactive';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  channelCount: number;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  status: 'online' | 'offline';
  url: string;
  number: number;
}

export interface Movie {
  id: string;
  title: string;
  cover: string;
  synopsis: string;
  genre: string[];
  year: number;
  rating: number;
  duration: string;
  url: string;
}

export interface Serie {
  id: string;
  title: string;
  cover: string;
  synopsis: string;
  genre: string[];
  year: number;
  rating: number;
  seasons: number;
  episodes: number;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  m3uListId: string;
  expiresAt: string;
  status: 'active' | 'suspended' | 'expired';
  devices: number;
  maxDevices: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: 'days' | 'months';
  maxDevices: number;
  maxChannels: number;
  features: string[];
  popular?: boolean;
}

export interface Settings {
  panelName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  theme: 'dark' | 'light';
  language: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}
