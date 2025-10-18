import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

function Hello(){ return <Text testID="hi">hi</Text>; }

test('smoke', async () => {
  render(<Hello />);
  expect(screen.getByTestId('hi')).toBeTruthy();
});
