import { render, screen, fireEvent } from '@testing-library/react';
import UserManagement from './UserManagement';

describe('UserManagement Page', () => {
  test('renders page title', () => {
    render(<UserManagement />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  test('renders search input and updates value', () => {
    render(<UserManagement />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(searchInput.value).toBe('Alice');
  });

  test('renders table headers', () => {
    render(<UserManagement />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  test('renders users from mock data', () => {
    render(<UserManagement />);

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
  });

  test('status badge shows correct styling text', () => {
    render(<UserManagement />);

    expect(screen.getAllByText('Active')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Inactive')[0]).toBeInTheDocument();
  });
});
