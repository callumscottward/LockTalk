import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import ChatDirectory from './ChatDirectory';

describe('ChatDirectory', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              id: '1',
              name: 'User 1',
              is_group: false,
              participants: [{ id: 1, username: 'User 1' }],
              time: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'User 2',
              is_group: false,
              participants: [{ id: 2, username: 'User 2' }],
              time: new Date().toISOString(),
            },
          ]),
      })
    ) as any;

    global.WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1,
    })) as any;
  });

  test('renders page title', async () => {
    render(<ChatDirectory />);
    expect(await screen.findByText(/Chat Directory/i)).toBeInTheDocument();
  });

  test('renders chat rows after fetch', async () => {
    render(<ChatDirectory />);

    expect(await screen.findByText('User 1')).toBeInTheDocument();
    expect(await screen.findByText('User 2')).toBeInTheDocument();
  });

  test('search filters chat list', async () => {
    render(<ChatDirectory />);

    await screen.findByText('User 1');

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 2')).not.toBeInTheDocument();
  });

  test('reset button clears search', async () => {
    render(<ChatDirectory />);

    const searchInput = await screen.findByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);

    expect(searchInput).toHaveValue('');
  });

  test('delete triggers confirm dialog', async () => {
    window.confirm = vi.fn(() => true);

    render(<ChatDirectory />);

    const deleteButtons = await screen.findAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
  });
});
