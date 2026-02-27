/**
 * Unit tests for feedsFilter state in the Zustand store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@hooks/useStore';

describe('feedsFilter store state', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useStore.setState({
      feedsFilter: 'unread',
    });
  });

  it('should default feedsFilter to "unread"', () => {
    const state = useStore.getState();
    expect(state.feedsFilter).toBe('unread');
  });

  it('should update feedsFilter to "starred"', () => {
    useStore.getState().setFeedsFilter('starred');
    expect(useStore.getState().feedsFilter).toBe('starred');
  });

  it('should update feedsFilter to "all"', () => {
    useStore.getState().setFeedsFilter('all');
    expect(useStore.getState().feedsFilter).toBe('all');
  });

  it('should update feedsFilter back to "unread"', () => {
    useStore.getState().setFeedsFilter('all');
    useStore.getState().setFeedsFilter('unread');
    expect(useStore.getState().feedsFilter).toBe('unread');
  });
});
