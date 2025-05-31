import React from 'react';
import renderer from 'react-test-renderer';
import Home from '../app/index';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Home />).toJSON();
    expect(tree).toBeTruthy();
  });
});
