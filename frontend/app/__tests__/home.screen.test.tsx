import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock Fetch
const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

// Mock useNavigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: mockNavigate }) };
});

// Mock useAuth
jest.mock('../context/Auth', () => ({ useAuth: jest.fn() }));
const { useAuth } = require('../context/Auth') as { useAuth: jest.Mock };

const HomeScreen = require('../screens/HomeScreen').default;

beforeEach(() => {
  fetchMock.mockReset();
  mockNavigate.mockReset();
  useAuth.mockReset();
});

test('Get List While First Load', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ([{ id: 1, title: 'A' }, { id: 2, title: 'B' }]),
  });
  useAuth.mockReturnValue({ user: null });

  render(<HomeScreen />);
  expect(await screen.findByText(/Records \(2\)/)).toBeTruthy();
});

test('Unsigned in: DELETE to SignIn ', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ([{ id: 1, title: 'A' }]),
  });
  useAuth.mockReturnValue({ user: null });

  render(<HomeScreen />);
  fireEvent.press(await screen.findByText('DELETE'));
  expect(mockNavigate).toHaveBeenCalledWith('SignIn');
});

test('Signed in: Empty Title CREATE -> "Invalid Title" ', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ([]),
  });
  useAuth.mockReturnValue({ user: { email: 'me@x' } });

  render(<HomeScreen />);
  fireEvent.press(await screen.findByText('CREATE'));
  expect(await screen.findByText(/Invalid Title/)).toBeTruthy();
});
