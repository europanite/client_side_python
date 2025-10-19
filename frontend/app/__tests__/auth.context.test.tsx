import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../context/Auth';

const fetchMock = jest.fn();
global.fetch = fetchMock as any;

function ShowUser() {
  const { user } = useAuth();
  return <Text testID="user">{user ? user.email : 'none'}</Text>;
}

let exposed: ReturnType<typeof useAuth> | null = null;
function Expose() {
  exposed = useAuth();
  return null;
}

beforeEach(() => {
  fetchMock.mockReset();
  exposed = null;
});

