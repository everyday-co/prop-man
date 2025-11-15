import { BadRequestException } from '@nestjs/common';

export type MonthDateRange = {
  start: string;
  end: string;
};

const MONTH_REGEX = /^\d{4}-\d{2}$/;

const validateMonth = (month: string): string => {
  if (!MONTH_REGEX.test(month)) {
    throw new BadRequestException(
      `Invalid month "${month}". Expected format YYYY-MM`,
    );
  }

  return month;
};

export const normalizeMonthInput = (month: string): string => {
  const trimmed = month.trim();

  validateMonth(trimmed);

  return trimmed;
};

export const getMonthDateRange = (month: string): MonthDateRange => {
  const normalizedMonth = normalizeMonthInput(month);
  const [yearString, monthString] = normalizedMonth.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    throw new BadRequestException(
      `Invalid month "${month}". Expected format YYYY-MM`,
    );
  }

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};
