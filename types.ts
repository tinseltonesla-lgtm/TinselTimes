
export enum Role {
  SOPRANO = 'Soprano',
  ALTO = 'Alto',
  TENOR = 'Tenor',
  BASS = 'Bass',
  BEATBOXER = 'Beatboxer'
}

export type Fluency = 'Beginner' | 'Conversational' | 'Fluent' | 'Native/Near-Native';

export interface Language {
  name: string;
  fluency: Fluency;
}

export interface Conflict {
  date: string; // Start Date (ISO Date YYYY-MM-DD)
  endDate?: string; // End Date (ISO Date YYYY-MM-DD) for ranges
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
}

export type AssignmentStatus = 'Pending' | 'Confirmed' | 'CoverageRequested';

export interface Performer {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  roles: Role[];
  isSubOnly: boolean;
  email: string;
  cellNumber: string;
  homePhone?: string;
  address: string;
  instagramHandle?: string;
  
  // Admin only / Sensitive fields
  fullLegalName: string;
  isSagAftra: boolean;
  ssn: string;
  bio: string; // 100 word limit
  favoriteHolidaySong: string;
  languages: Language[];
  
  // Physical measurements
  height: string;
  shirtSize: string;
  shoeSize: string;
  dressSize?: string;
  pantSize: string;
  hatSize: string;
  
  // Availability Checkpoints
  inTownThanksgiving: boolean;
  inTownChristmasEve: boolean;
  inTownChristmas: boolean;
  inTownNYE: boolean;
  inTownNewYears: boolean;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactCell: string;
  
  // Skills/Travel
  canBeatbox: boolean;
  travelZones: {
    zone2: boolean;
    zone3: boolean;
    zone4: boolean;
    zone5: boolean;
  };
  
  conflicts: Conflict[];
}

export interface GigAssignment {
  role: Role;
  performerId: string | null;
  status: AssignmentStatus;
}

export interface Gig {
  id: string;
  title: string;
  location: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  assignments: GigAssignment[];
  status: 'Draft' | 'Confirmed' | 'Completed';
}

export type View = 'CAROLER_PORTAL' | 'ADMIN_PORTAL' | 'LANDING' | 'REGISTRATION';
