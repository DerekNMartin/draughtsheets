import { parse } from 'node-html-parser';

type StatColumns = [
  'player',
  'att',
  'cmp',
  'yds',
  'tds',
  'ints',
  'fl',
  'fpts',
  'rec'
];
type HeaderKeys = 'passing' | 'rushing' | 'receiving' | 'misc';
type SubHeadingKeys = Exclude<StatColumns[number], 'player'>[];
export type ProjectionsPlayer = {
  player_id?: string;
  player?: string;
  fpts?: string | number;
  passing?: Partial<Record<SubHeadingKeys[number], string>>;
  rushing?: Partial<Record<SubHeadingKeys[number], string>>;
  receiving?: Partial<Record<SubHeadingKeys[number], string>>;
  misc?: Partial<Record<SubHeadingKeys[number], string>>;
};

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
  const subHeadings = table
    ?.querySelectorAll('th')
    .map(({ text }) => text.toLowerCase()) as StatColumns;
  const headingMap = table
    ?.querySelector('thead')
    ?.querySelectorAll('td')
    .reduce<Record<string, string[]>[]>((acc, subHeadingElement) => {
      if (subHeadingElement.textContent.trim()) {
        const end = Number(subHeadingElement.getAttribute('colspan'));
        const heading = subHeadingElement.textContent.toLowerCase();
        const headingObj: Record<string, string[]> = {};
        headingObj[heading] = subHeadings.splice(1, end);
        acc.push(headingObj);
      }
      return acc;
    }, []);
  const rows = table?.querySelector('tbody')?.querySelectorAll('tr');
  const data = rows?.reduce<ProjectionsPlayer[]>((dataArr, row) => {
    const id = row.classList?.value[0].match(/\d/g)?.join('');
    const rowValues = row
      .querySelectorAll('td')
      .map((item) => item.textContent);
    const player: ProjectionsPlayer = {
      player_id: id,
      player: rowValues[0],
      fpts: rowValues[rowValues.length - 1],
    };

    let statIndex = 1;

    headingMap?.forEach((headingObj) => {
      const heading = Object.keys(headingObj)[0] as HeaderKeys; // Get the heading name
      const subHeadingsForHeading = headingObj[heading] as SubHeadingKeys; // Get the subheadings for this heading

      player[heading] = {}; // Initialize an empty object for this heading

      subHeadingsForHeading.forEach((subHeading) => {
        if (player[heading]) player[heading][subHeading] = rowValues[statIndex]; // Map the stat to the subheading
        statIndex++;
      });
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
