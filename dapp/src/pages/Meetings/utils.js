/**
 * Date utils
 */
export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 30;

export function prettyDuration(ms) {
  const weeks = Math.trunc(ms / ONE_WEEK);
  ms = ms % ONE_WEEK;
  const days = Math.trunc(ms / ONE_DAY);
  ms = ms % ONE_DAY;
  const hours = Math.trunc(ms / ONE_HOUR);
  ms = ms % ONE_HOUR;
  const minutes = Math.trunc(ms / ONE_MINUTE);
  const b = [];
  if (weeks > 0) {
    b.push(weeks === 1 ? "one week" : weeks + " weeks");
  }
  if (days > 0) {
    b.push(days === 1 ? "one day" : days + " days");
  }
  if (hours > 0) {
    b.push(hours === 1 ? "one hour" : hours + " hours");
  }
  if (minutes > 0) {
    b.push(minutes === 1 ? "one minute" : minutes + " minutes");
  }
  const last = b.pop();
  if (b.length > 0) {
    return `${b.join(", ")}${b.length > 1 ? "," : ""} and ${last}`;
  } else if (last !== undefined) {
    return last;
  } else {
    return "less than one hour";
  }
}

window.pd = prettyDuration;

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
    [pad(date.getHours()), pad(date.getMinutes())].join(":"),
  ];
}

export function fromSplitToTimestamp(date, time) {
  return Math.round(new Date(`${date}T${time}:00`).getTime() / 1000);
}

/**
 * Bitmap utils
 */

import { BigNumber } from "etherea";

const ZERO = BigNumber.from(0);
const ONE = BigNumber.from(1);

export function createBitmaps(list) {
  const bitmaps = {};
  for (const element of list) {
    const cluster = Math.floor(element / 256);
    const index = element % 256;
    bitmaps[cluster] = (bitmaps[cluster] || ZERO).or(ONE.shl(index));
  }
  return bitmaps;
}

export function toBinary(bn, bits = 256) {
  const hexString = bn.toHexString().substr(2);
  let result = "";
  for (let i = 0; i < hexString.length; i += 2) {
    const binary = parseInt(hexString.substring(i, i + 3), 16)
      .toString(2)
      .padStart(2, "0");
    result += binary;
  }
  return result.padStart(256, "0");
}
