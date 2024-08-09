export function interpolateRgbColor(
  minColour: string,
  maxColour: string,
  minNum: number,
  maxNum: number,
  value: number
) {
  const shiftAmount = Math.abs(minNum);
  const range = Math.abs(minNum + shiftAmount - (maxNum + shiftAmount));
  const stepFactor = 1 / (range - 1);

  const colour1 = minColour.match(/\d+/g)?.map(Number) || [];
  const colour2 = maxColour.match(/\d+/g)?.map(Number) || [];

  const colorArr = colour1?.map((rgb, index) =>
    Math.round(
      rgb +
        stepFactor *
          (value + shiftAmount - 1) *
          (colour2[index] - colour1[index])
    )
  );

  return `rgb(${colorArr.join(',')})`;
}
