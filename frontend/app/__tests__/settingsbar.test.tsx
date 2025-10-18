import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock useAuth
jest.mock('../context/Auth', () => ({ useAuth: jest.fn() }));
const { useAuth } = require('../context/Auth') as { useAuth: jest.Mock };

// Mock useNavigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: mockNavigate }) };
});

beforeEach(() => { useAuth.mockReset(); mockNavigate.mockReset(); });

test('Shows Unsigned in:  Sign In/Up Button', () => {
  useAuth.mockReturnValue({ user: null, signOut: jest.fn() });
  const Comp = require('../components/SettingsBar').default;

  render(<Comp />);
  expect(screen.getByText('Not signed in')).toBeTruthy();
  expect(screen.getByText('Sign Up')).toBeTruthy();
  expect(screen.getByText('Sign In')).toBeTruthy();
});

test('Login: Email and Sign out', () => {
  const signOut = jest.fn();
  useAuth.mockReturnValue({ user: { email: 'me@x' }, signOut });
  const Comp = require('../components/SettingsBar').default;

  render(<Comp />);
  expect(screen.getByText('me@x')).toBeTruthy();
  fireEvent.press(screen.getByText('Sign out'));
  expect(signOut).toHaveBeenCalled();
});
