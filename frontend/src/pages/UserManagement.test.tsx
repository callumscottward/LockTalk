import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import UserManagement from './UserManagement';

const mockUsers = [
  {
    id: 1,
    username: 'Alice',
    email: 'alice@example.com',
    is_staff: true,
    is_active: true,
    date_joined: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    username: 'Bob',
    email: 'bob@example.com',
    is_staff: false,
    is_active: false,
    date_joined: '2024-02-01T10:00:00Z',
  },
];

beforeEach(() => {
  vi.resetAllMocks();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockUsers),
    })
  ) as any;
});

describe('UserManagement Page', () => {

  it('renders page title', () => {
    render(<UserManagement />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  it('loads and displays users', async () => {
    render(<UserManagement />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('filters users by search input', async () => {
    render(<UserManagement />);

    await screen.findByText('Alice');

    const search = screen.getByPlaceholderText(/search by name/i);

    await userEvent.type(search, 'Alice');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('renders role labels correctly', async () => {
    render(<UserManagement />);

    await screen.findByText('Alice');

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders active/inactive badges', async () => {
    render(<UserManagement />);

    await screen.findByText('Alice');

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
