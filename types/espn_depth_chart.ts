export interface ESPNDepthChartResponse {
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: Item[];
}

interface Item {
  id: string;
  name: string;
  positions: Positions;
}

interface Positions {
  lde?: Lde;
  nt?: Lde;
  rde?: Lde;
  wlb?: Lde;
  lilb?: Lde;
  rilb?: Lde;
  slb?: Lde;
  lcb?: Lde;
  ss?: Lde;
  fs?: Lde;
  rcb?: Lde;
  nb?: Lde;
  pk?: Lde;
  p?: Lde;
  h?: Lde;
  pr?: Lde;
  kr?: Lde;
  ls?: Lde;
  wr?: Lde;
  lt?: Lde;
  lg?: Lde;
  c?: Lde;
  rg?: Lde;
  rt?: Lde;
  qb?: Lde;
  te?: Lde;
  rb?: Lde;
  fb?: Lde;
}

interface Lde {
  position: Position;
  athletes: Athlete[];
}

interface Athlete {
  slot: number;
  athlete: Parent;
  rank: number;
}

interface Position {
  $ref: string;
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  leaf: boolean;
  parent: Parent;
}

interface Parent {
  $ref: string;
}

export const ESPN_TEAM_IDS = {
  ARI: 22,
  ATL: 1,
  BAL: 33,
  BUF: 2,
  CAR: 29,
  CHI: 3,
  CIN: 4,
  CLE: 5,
  DAL: 6,
  DEN: 7,
  DET: 8,
  GB: 9,
  HOU: 34,
  IND: 11,
  JAC: 30,
  KC: 12,
  LV: 13,
  LAC: 24,
  LAR: 14,
  MIA: 15,
  MIN: 16,
  NE: 17,
  NO: 18,
  NYG: 19,
  NYJ: 20,
  PHI: 21,
  PIT: 23,
  SF: 25,
  SEA: 26,
  TB: 27,
  TEN: 10,
  WAS: 28,
} as const;
