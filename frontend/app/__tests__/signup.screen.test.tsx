import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../screens/SignUpScreen';

const mockSignUp = jest.fn().mockResolvedValue(undefined);
jest.mock('../context/Auth', () => ({ useAuth: () => ({ signUp: mockSignUp }) }));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: mockNavigate }) };
});

beforeEach(() => { mockSignUp.mockClear(); mockNavigate.mockClear(); });

test('Sign Up to Home ', async () => {
  render(<SignUpScreen />);
  fireEvent.changeText(screen.getByTestId('email'), 'a@b.c');
  fireEvent.changeText(screen.getByTestId('password'), 'pw');
  fireEvent.press(screen.getByTestId('submit'));

  await waitFor(() => {
    expect(mockSignUp).toHaveBeenCalledWith('a@b.c', 'pw');
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
});
