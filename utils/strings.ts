export function calculateRoundPick(ecr: number, leagueSize: number) {
  const round = Math.ceil(ecr / leagueSize);
  const pick = ecr % leagueSize || leagueSize;
  return [round, String(pick).padStart(2, '0')];
}
