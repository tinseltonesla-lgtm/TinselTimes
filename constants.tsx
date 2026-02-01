
import { Role, Performer, Gig } from './types';

export const INITIAL_PERFORMERS: Performer[] = [
  {
    id: 'admin1',
    username: 'Joey Donohoe',
    password: 'H!larious13!',
    isAdmin: true,
    firstName: 'Joey',
    lastName: 'Donohoe',
    roles: [], // Pure Admin has no vocal roles
    isSubOnly: false,
    email: 'joey@tinseltimes.com',
    cellNumber: '555-9999',
    address: 'HQ North Pole',
    fullLegalName: 'Joey Donohoe',
    isSagAftra: false,
    ssn: '000-00-0000',
    bio: 'Founder and Lead Administrator of TinselTimes.',
    favoriteHolidaySong: 'Deck the Halls',
    languages: [{ name: 'English', fluency: 'Native/Near-Native' }],
    // Measurements and caroler-specific data kept empty/default for pure admin
    height: "",
    shirtSize: '',
    shoeSize: '',
    dressSize: '',
    pantSize: '',
    hatSize: '',
    inTownThanksgiving: true,
    inTownChristmasEve: true,
    inTownChristmas: true,
    inTownNYE: true,
    inTownNewYears: true,
    emergencyContactName: 'Office Manager',
    emergencyContactCell: '555-0001',
    canBeatbox: false,
    travelZones: { zone2: false, zone3: false, zone4: false, zone5: false },
    conflicts: []
  },
  {
    id: 'p1',
    username: 'sarah.soprano',
    password: 'password123',
    isAdmin: false,
    firstName: 'Sarah',
    lastName: 'Soprano',
    roles: [Role.SOPRANO],
    isSubOnly: false,
    email: 'sarah@example.com',
    cellNumber: '555-0101',
    address: '123 Holly Lane, North Pole',
    fullLegalName: 'Sarah Seraphina Soprano',
    isSagAftra: true,
    ssn: 'XXX-XX-0001',
    bio: 'Sarah has been singing carols since she could talk. She loves the high notes and the cold air.',
    favoriteHolidaySong: 'O Holy Night',
    languages: [{ name: 'English', fluency: 'Native/Near-Native' }],
    height: "5'6\"",
    shirtSize: 'M',
    shoeSize: '8.5',
    dressSize: '6',
    pantSize: '28',
    hatSize: '7',
    inTownThanksgiving: true,
    inTownChristmasEve: false,
    inTownChristmas: false,
    inTownNYE: true,
    inTownNewYears: true,
    emergencyContactName: 'John Soprano',
    emergencyContactCell: '555-0202',
    canBeatbox: false,
    travelZones: { zone2: true, zone3: true, zone4: false, zone5: false },
    conflicts: [
      { date: '2024-12-24', allDay: true },
      { date: '2024-12-25', allDay: true }
    ]
  }
];

export const INITIAL_GIGS: Gig[] = [
  {
    id: 'g1',
    title: 'Town Square Tree Lighting',
    location: 'Central Plaza',
    date: '2024-12-10',
    startTime: '18:00',
    endTime: '20:00',
    status: 'Confirmed',
    assignments: [
      { role: Role.SOPRANO, performerId: 'p1', status: 'Pending' },
      { role: Role.ALTO, performerId: null, status: 'Pending' },
      { role: Role.TENOR, performerId: null, status: 'Pending' },
      { role: Role.BASS, performerId: null, status: 'Pending' },
      { role: Role.BEATBOXER, performerId: null, status: 'Pending' },
    ]
  }
];
