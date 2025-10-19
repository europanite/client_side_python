import React from 'react';
import { render, screen } from '@testing-library/react-native';

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

test('SettingsBar renders without crashing', () => {
  const SettingsBar = require('../components/SettingsBar').default;
  useAuth.mockReturnValue({ user: null, token: null, authHeader: () => ({}) });
  render(<SettingsBar />);
  // No strict text to assert (bar is mostly layout), just verify render
  expect(true).toBe(true);
});