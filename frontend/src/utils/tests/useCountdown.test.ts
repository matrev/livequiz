import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../useCountdown';

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when no deadline is provided', () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toBeNull();
  });

  it('returns null when deadline is undefined', () => {
    const { result } = renderHook(() => useCountdown(undefined));
    expect(result.current).toBeNull();
  });

  it('returns null when deadline is in the past', () => {
    const past = new Date(NOW - 60_000).toISOString();
    const { result } = renderHook(() => useCountdown(past));
    expect(result.current).toBeNull();
  });

  it('returns a formatted countdown string when deadline is in the future', () => {
    const future = new Date(NOW + 90_000).toISOString(); // 1m 30s
    const { result } = renderHook(() => useCountdown(future));
    expect(result.current).toBe('1m 30s');
  });

  it('includes hours in format when more than 60 minutes remain', () => {
    const future = new Date(NOW + 3_661_000).toISOString(); // 1h 1m 1s
    const { result } = renderHook(() => useCountdown(future));
    expect(result.current).toBe('1h 1m 1s');
  });

  it('includes days in format when more than 24 hours remain', () => {
    const future = new Date(NOW + 90_061_000).toISOString(); // 1d 1h 1m 1s
    const { result } = renderHook(() => useCountdown(future));
    expect(result.current).toBe('1d 1h 1m 1s');
  });

  it('counts down each second via interval', () => {
    const future = new Date(NOW + 5_000).toISOString(); // 5s
    const { result } = renderHook(() => useCountdown(future));

    expect(result.current).toBe('0m 5s');

    act(() => { jest.advanceTimersByTime(1_000); });
    expect(result.current).toBe('0m 4s');

    act(() => { jest.advanceTimersByTime(1_000); });
    expect(result.current).toBe('0m 3s');
  });

  it('updates when deadline changes after initial render', () => {
    const future = new Date(NOW + 10_000).toISOString(); // 10s

    const { result, rerender } = renderHook(
      ({ deadline }: { deadline: string | null | undefined }) => useCountdown(deadline),
      { initialProps: { deadline: null } },
    );

    expect(result.current).toBeNull();

    act(() => {
      rerender({ deadline: future });
    });

    // After the deadline prop updates, the countdown should reflect the new value immediately
    expect(result.current).toBe('0m 10s');

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current).toBe('0m 9s');
  });
  it('returns null after countdown reaches zero', () => {
    const future = new Date(NOW + 2_000).toISOString(); // 2s
    const { result } = renderHook(() => useCountdown(future));

    expect(result.current).toBe('0m 2s');

    act(() => { jest.advanceTimersByTime(3_000); });
    expect(result.current).toBeNull();
  });
});
