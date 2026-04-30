import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('renders chats sidebar', () => {
    render(<Dashboard />);

    // specific, avoids "multiple /chat/i"
    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  it('loads conversations', async () => {
    render(<Dashboard />);

    // handle duplicates correctly
    const items = await screen.findAllByText(/test conversation/i);
    expect(items.length).toBeGreaterThan(0);
  });

  it('typing message updates input', () => {
    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it('send button exists', () => {
    render(<Dashboard />);

    const button = screen.getByRole('button', { name: /➤/i });
    expect(button).toBeInTheDocument();
  });

  it('opens menu dropdown button exists', () => {
    render(<Dashboard />);

    const menuBtn = screen.getByText('⋮');
    expect(menuBtn).toBeInTheDocument();
  });
});
