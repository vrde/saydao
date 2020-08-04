/**
 * Date utils
 */
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
