const axios = require("axios"); // Change the import to use CommonJS syntax
const MockAdapter = require("axios-mock-adapter"); // Change the import to use CommonJS syntax
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchUser from "./Index";

// Mock the axios requests using axios-mock-adapter
const mock = new MockAdapter(axios);

test("renders search user form and fetches users on search", async () => {
  // Mock the response for the initial popular users fetch
  mock.onGet("https://api.github.com/search/users").reply(200, {
    items: [{ login: "user1" }, { login: "user2" }],
  });

  render(<SearchUser />);

  // Expect the popular users to be displayed initially
  await waitFor(() => {
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
  });

  // Mock the response for the user search
  mock.onGet("/search/users").reply(200, {
    items: [{ login: "user3" }, { login: "user4" }],
  });

  // Type "user" in the search input
  const searchInput = screen.getByRole("textbox");
  userEvent.type(searchInput, "user");

  // Expect the search results to be displayed
  await waitFor(() => {
    expect(screen.getByText("user3")).toBeInTheDocument();
    expect(screen.getByText("user4")).toBeInTheDocument();
  });
});
