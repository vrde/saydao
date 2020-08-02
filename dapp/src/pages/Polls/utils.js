export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 30;

export function splitDate(date) {
  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }
  if (!date) {
    date = new Date();
  }
  return [
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      "-"
    ),
    [pad(date.getHours()), pad(date.getMinutes())].join(":")
  ];
}

export function fromSplitToTimestamp(date, time) {
  return Math.round(new Date(`${date}T${time}:00`).getTime() / 1000);
}
