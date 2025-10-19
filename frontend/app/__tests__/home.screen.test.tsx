import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock pyodide to avoid network and heavy init
jest.mock('pyodide', () => ({
  loadPyodide: jest.fn().mockResolvedValue({
    setStdout: jest.fn(),
    setStderr: jest.fn(),
    runPythonAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock clipboard used by Copy Output button
Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });

// Mock react-navigation (only what HomeScreen touches indirectly)
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

// Mock useAuth to a simple anonymous state
jest.mock('../context/Auth', () => ({ useAuth: jest.fn(() => ({ user: null })) }));

const HomeScreen = require('../screens/HomeScreen').default;

test('renders title, code and console areas', async () => {
  render(<HomeScreen />);
  // Title link
  expect(await screen.findByText('Python Front')).toBeTruthy();
  // Buttons (labels come from MUI Buttons)
  expect(screen.getByRole('button', { name: /Run/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Clear/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Load Sample/i })).toBeTruthy();
  // Console label
  expect(screen.getByText('Console')).toBeTruthy();
});