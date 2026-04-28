import { render, screen, fireEvent } from '@testing-library/react';
import ChatDirectory from './ChatDirectory';

describe('ChatDirectory', () => {
  test('renders page title', () => {
    render(<ChatDirectory />);
    expect(screen.getByText(/Chat Directory/i)).toBeInTheDocument();
  });

  test('renders initial chat rows', () => {
    render(<ChatDirectory />);

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  test('search filters chat list', () => {
    render(<ChatDirectory />);

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 2')).not.toBeInTheDocument();
  });

  test('reset button clears search', () => {
    render(<ChatDirectory />);

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);

    expect(searchInput.value).toBe('');
  });

  test('delete removes a chat after confirmation', () => {
    window.confirm = jest.fn(() => true);

    render(<ChatDirectory />);

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
  });
});
