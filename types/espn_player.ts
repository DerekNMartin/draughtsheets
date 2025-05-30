export interface ESPNPlayerResponse {
  $ref: string;
  id: string;
  uid: string;
  guid: string;
  type: string;
  alternateIds: AlternateIds;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  weight: number;
  displayWeight: string;
  height: number;
  displayHeight: string;
  age: number;
  dateOfBirth: string;
  debutYear: number;
  links: Link[];
  birthPlace: BirthPlace;
  college: College;
  slug: string;
  headshot: Headshot;
  jersey: string;
  position: Position;
  injuries: any[];
  linked: boolean;
  team: College;
  teams: College[];
  statistics: College;
  notes: College;
  contracts: College;
  experience: Experience;
  collegeAthlete: College;
  active: boolean;
  eventLog: College;
  draft: Draft;
  status: Status;
}

interface Status {
  id: string;
  name: string;
  type: string;
  abbreviation: string;
}

interface Draft {
  displayText: string;
  round: number;
  year: number;
  selection: number;
  team: College;
  pick: College;
}

interface Experience {
  years: number;
}

interface Position {
  $ref: string;
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  leaf: boolean;
  parent: College;
}

interface Headshot {
  href: string;
  alt: string;
}

interface College {
  $ref: string;
}

interface BirthPlace {
  city: string;
  state: string;
  country: string;
}

interface Link {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface AlternateIds {
  sdr: string;
}
