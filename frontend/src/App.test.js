import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard heading", () => {
  render(<App />);
  expect(
    screen.getByText(/readable post drafts, faster reviews, and a cleaner publishing flow/i)
  ).toBeInTheDocument();
});
