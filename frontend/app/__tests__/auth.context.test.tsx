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

test('signIn sets user/token', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'tok' }),
  });

  render(<AuthProvider><Expose /><ShowUser /></AuthProvider>);
  expect(exposed).toBeTruthy();

  await act(async () => {
    await exposed!.signIn('u@example.com', 'pw');
  });

  await waitFor(() => {
    expect(screen.getByTestId('user').props.children).toBe('u@example.com');
  });
});

test('signUp calls signIn internally', async () => {
  // /auth/signup → 200
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  // /auth/signin → 200
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'tok' }),
  });

  render(<AuthProvider><Expose /><ShowUser /></AuthProvider>);
  await act(async () => {
    await exposed!.signUp('u2@example.com', 'pw');
  });

  expect(fetchMock).toHaveBeenCalledTimes(2); // signup -> signin
  expect(fetchMock.mock.calls[0][0]).toContain('/auth/signup');
  expect(fetchMock.mock.calls[1][0]).toContain('/auth/signin');
});
