import { parse } from 'node-html-parser';

type StatColumns = [
  'player',
  'att',
  'cmp',
  'yds',
  'tds',
  'ints',
  'att',
  'yds',
  'tds',
  'fl',
  'fpts'
];
type ColumnKeys = StatColumns[number];
export type ProjectionsPlayer = {
  [key in ColumnKeys]?: string | number;
} & { player_id?: string };

const validPositionQueries = ['qb', 'rb', 'wr', 'te', 'k', 'dst'] as const;
type Position = (typeof validPositionQueries)[number];
interface QueryInterface {
  position: Position;
}

function handleQueries(query: QueryInterface) {
  const position = query?.position || 'qb';

  if (!validPositionQueries.includes(position)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid Query - position is not valid',
    });
  }

  return { position };
}

function parseProjectionsTable(response: string) {
  const pageRoot = parse(response);
  const table = pageRoot.getElementById('data');
  const headings = table
    ?.querySelectorAll('th')
    .map(({ text }) => text.toLowerCase()) as StatColumns;
  const rows = table?.querySelector('tbody')?.querySelectorAll('tr');
  const data = rows?.reduce<ProjectionsPlayer[]>((dataArr, row) => {
    const player: ProjectionsPlayer = {};
    const id = row.classList?.value[0].match(/\d/g)?.join('');
    player.player_id = id;
    row.querySelectorAll('td').forEach((item, index) => {
      const key = headings[index];
      player[key] = item.textContent;
    });
    dataArr.push(player);
    return dataArr;
  }, []);
  return data;
}

export default defineEventHandler(async (event) => {
  const query = getQuery<QueryInterface>(event);
  const { position } = handleQueries(query);
  const response: string = await $fetch(
    `https://www.fantasypros.com/nfl/projections/${position}.php?week=draft`
  );
  return parseProjectionsTable(response);
});
