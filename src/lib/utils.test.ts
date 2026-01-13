import { describe, it, expect } from 'vitest';
import { cn, formatDuration, formatTime, formatFileSize, formatDate } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle object notation', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });
  });

  describe('formatDuration', () => {
    it('should return empty string for null', () => {
      expect(formatDuration(null)).toBe('');
    });

    it('should return empty string for 0', () => {
      expect(formatDuration(0)).toBe('');
    });

    it('should format seconds less than an hour', () => {
      expect(formatDuration(45)).toBe('0 min');
      expect(formatDuration(60)).toBe('1 min');
      expect(formatDuration(120)).toBe('2 min');
      expect(formatDuration(300)).toBe('5 min');
      expect(formatDuration(2700)).toBe('45 min');
    });

    it('should format seconds equal to or greater than an hour', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(5400)).toBe('1h 30m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(9000)).toBe('2h 30m');
    });

    it('should handle large values', () => {
      expect(formatDuration(36000)).toBe('10h 0m');
    });
  });

  describe('formatTime', () => {
    it('should return 0:00 for falsy values', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(NaN)).toBe('0:00');
    });

    it('should format seconds correctly', () => {
      expect(formatTime(1)).toBe('0:01');
      expect(formatTime(9)).toBe('0:09');
      expect(formatTime(10)).toBe('0:10');
      expect(formatTime(59)).toBe('0:59');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(61)).toBe('1:01');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(599)).toBe('9:59');
    });

    it('should format values over 10 minutes', () => {
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(3599)).toBe('59:59');
    });

    it('should pad seconds with leading zero', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(605)).toBe('10:05');
    });

    it('should handle decimal values by flooring', () => {
      expect(formatTime(65.7)).toBe('1:05');
      expect(formatTime(59.9)).toBe('0:59');
    });
  });

  describe('formatFileSize', () => {
    it('should return empty string for null', () => {
      expect(formatFileSize(null)).toBe('');
    });

    it('should return empty string for 0', () => {
      expect(formatFileSize(0)).toBe('');
    });

    it('should format bytes', () => {
      expect(formatFileSize(100)).toBe('100.0 B');
      expect(formatFileSize(500)).toBe('500.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(10485760)).toBe('10.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
      expect(formatFileSize(2147483648)).toBe('2.0 GB');
    });
  });

  describe('formatDate', () => {
    it('should format date string and return a non-empty string', () => {
      const result = formatDate('2024-03-15');
      // The result should be a non-empty formatted date string
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });

    it('should format Date object', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should accept locale parameter', () => {
      const resultDefault = formatDate('2024-03-15');
      const resultEnUS = formatDate('2024-03-15', 'en-US');
      // Both should return valid formatted dates
      expect(resultDefault).toBeTruthy();
      expect(resultEnUS).toBeTruthy();
    });

    it('should return valid date format for any valid input', () => {
      const result = formatDate('2024-12-25');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(5);
    });
  });
});
