import { render, screen } from '@testing-library/react';
import Hover from './Hover';

test('renders learn react link', () => {
  render(<Hover />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
