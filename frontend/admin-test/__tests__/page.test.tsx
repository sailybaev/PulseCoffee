import { render, screen } from '@testing-library/react'
import Home from '../src/app/page'

// Mock the PulseCoffeeAdminTest component since it has dependencies
jest.mock('../src/components/PulseCoffeeAdminTest', () => {
  return {
    PulseCoffeeAdminTest: () => <div data-testid="admin-test">Admin Test Component</div>
  }
})

describe('Home Page', () => {
  it('renders the admin test component', () => {
    render(<Home />)
    const adminTest = screen.getByTestId('admin-test')
    expect(adminTest).toBeInTheDocument()
  })
})
