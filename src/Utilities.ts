export const COMBINATIONS = [
  1,       // 6 numbers
  7,       // 7 numbers
  28,      // 8 numbers
  84,      // 9 numbers
  210,     // 10 numbers
  462,     // 11 numbers
  924,     // 12 numbers
  1716,    // 13 numbers
  3003,    // 14 numbers
  5005,    // 15 numbers
  8008,    // 16 numbers
  12376,   // 17 numbers
  18564,   // 18 numbers
  27132,   // 19 numbers
  38760,   // 20 numbers
];


export function range(length: number): number[] {
  return Array.from({length}, (_, i) => i);
}


export function choose(n: number, k: number): number {
  if (k > n) {
    console.error(`cannot calculate (${n} choose ${k}).`);
    return 0;
  } else if (0 === k) {
    return 1;
  } else if (k > n / 2) {
    return choose(n, n - k);
  } else {
    return n * choose(n - 1, k - 1) / k;
  }
}


export function deepCompare(first: any, second: any): boolean {
  if (typeof first !== typeof second) {
    return false;
  }
  if ('object' !== typeof first) {
    return first === second;
  } else if (Array.isArray(first)) {
    if (Array.isArray(second) && first.length === second.length) {
      return first.every((item, index) => deepCompare(item, second[index]));
    } else {
      return false;
    }
  } else if (first instanceof Date) {
    if (second instanceof Date) {
      return first.valueOf() === second.valueOf();
    } else {
      return false;
    }
  } else if (first !== null) {
    for (const key in first) {
      if (Object.prototype.hasOwnProperty.call(first, key)) {
        if (!deepCompare(first[key], second[key])) {
          return false;
        }
      }
    }
    return true;
  } else {
    return second === null;
  }
}


const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MINUTE_IN_MS = 60 * 1000;

// Drawings are done every Saturday at 19:00 or 20:00, depending on DST.
const DRAW_SYNC_TIME = 237600000;


export function getTimeOfNextDraw(): number {
  const now = Date.now();
  const time = Math.ceil((now - DRAW_SYNC_TIME) / ONE_WEEK_IN_MS) * ONE_WEEK_IN_MS + DRAW_SYNC_TIME;
  return Math.floor(time / ONE_MINUTE_IN_MS) * ONE_MINUTE_IN_MS;
}
