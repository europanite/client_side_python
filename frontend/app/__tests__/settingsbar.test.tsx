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

