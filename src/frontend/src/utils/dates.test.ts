import { describe, expect, it } from "vitest";
import {
  calendarDays,
  formatDay,
  formatIsoDate,
  formatMonthYear,
  localeDateOrder,
  localeWeekStart,
  parseDateInput,
  weekdayNames,
  weekdayPosition,
} from "./dates";

describe("date order", () => {
  it("reads the field order from the locale", () => {
    expect(localeDateOrder("en-US")).toBe("mdy");
    expect(localeDateOrder("en-GB")).toBe("dmy");
    expect(localeDateOrder("hu-HU")).toBe("ymd");
  });

  it("formats in the chosen order", () => {
    expect(formatIsoDate("2026-10-05", "dmy")).toBe("05/10/2026");
    expect(formatIsoDate("2026-10-05", "mdy")).toBe("10/05/2026");
    expect(formatIsoDate("2026-10-05", "ymd")).toBe("2026-10-05");
    expect(formatIsoDate("", "dmy")).toBe("");
  });

  it("parses typed dates in the chosen order", () => {
    expect(parseDateInput("5/10/2026", "dmy")).toBe("2026-10-05");
    expect(parseDateInput("10/5/2026", "mdy")).toBe("2026-10-05");
    expect(parseDateInput("05.10.26", "dmy")).toBe("2026-10-05");
    expect(parseDateInput("2026-10-05", "dmy")).toBe("2026-10-05");
  });

  it("rejects dates that don't exist", () => {
    expect(parseDateInput("31/02/2026", "dmy")).toBeNull();
    expect(parseDateInput("13/13/2026", "mdy")).toBeNull();
    expect(parseDateInput("26/10", "dmy")).toBeNull();
  });
});

describe("week start", () => {
  it("reads the first day of the week from the locale", () => {
    expect(localeWeekStart("en-US")).toBe(0);
    expect(localeWeekStart("en-GB")).toBe(1);
  });

  it("starts the calendar grid on that day", () => {
    // October 2026 starts on a Thursday
    expect(calendarDays(2026, 9, 1)[0].getDay()).toBe(1);
    expect(calendarDays(2026, 9, 1)[3].getDate()).toBe(1);
    expect(calendarDays(2026, 9, 0)[0].getDay()).toBe(0);
    expect(calendarDays(2026, 9, 0)[4].getDate()).toBe(1);
  });
});

describe("display formats", () => {
  const date = new Date(2026, 9, 5, 14, 30);

  it("orders days with month names by the chosen format", () => {
    expect(formatDay(date, "dmy")).toBe("5 Oct 2026");
    expect(formatDay(date, "mdy")).toBe("Oct 5, 2026");
    expect(formatDay(date, "ymd")).toBe("2026 Oct 5");
    expect(formatDay(date, "dmy", { year: "none" })).toBe("5 Oct");
    expect(formatDay(date, "mdy", { weekday: "short" })).toBe("Mon, Oct 5, 2026");
  });

  it("orders months the same way", () => {
    expect(formatMonthYear(date, "dmy")).toBe("Oct 2026");
    expect(formatMonthYear(date, "ymd")).toBe("2026 Oct");
  });

  it("lists weekdays from the first day of the week", () => {
    expect(weekdayNames(1)[0]).toBe("Monday");
    expect(weekdayNames(0)[0]).toBe("Sunday");
    // a Sunday is the last day of a Monday week and the first of a Sunday week
    expect(weekdayPosition(0, 1)).toBe(6);
    expect(weekdayPosition(0, 0)).toBe(0);
  });
});
