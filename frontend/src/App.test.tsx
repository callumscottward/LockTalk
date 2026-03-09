import { render, screen } from "@testing-library/react"
import { test, expect } from "vitest"
import { MemoryRouter } from "react-router-dom"
import App from "./App"

test('renders app title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )
  const title = screen.getByText(/welcome to locktalk/i)
  expect(title).not.toBeNull()
})