import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../screens/SignInScreen';

// Mock useAuth
const mockSignIn = jest.fn().mockResolvedValue(undefined);
jest.mock('../context/Auth', () => ({ useAuth: () => ({ signIn: mockSignIn }) }));

// Mock useNavigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: mockNavigate }) };
});

beforeEach(() => {
  mockSignIn.mockClear();
  mockNavigate.mockClear();
});

test('入力→Sign In→Home 遷移', async () => {
  render(<SignInScreen />);
  fireEvent.changeText(screen.getByTestId('email'), ' user@example.com ');
  fireEvent.changeText(screen.getByTestId('password'), 'pw');
  fireEvent.press(screen.getByTestId('submit'));

  await waitFor(() => {
    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'pw'); // trim
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
});
