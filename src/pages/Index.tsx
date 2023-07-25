import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Card,
  CardContent,
  FormControl,
  OutlinedInput,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import { Octokit } from "octokit";
import { debounce } from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../assets/loading-animation.json";

interface Iusers {
  id: number;
  login: string;
}

interface Irepos {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
}

function SearchUser() {
  const [expanded, setExpanded] = useState<string | number | false>(false);
  const [users, setUsers] = useState<Iusers[] | []>([]);
  const [repos, setRepos] = useState<Irepos[] | []>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const octokit = new Octokit();

  const handleSearch = () => {
    if (searchTerm.length > 0) {
      getUsers();
    }
  };

  const debouncedHandleSearch = debounce(handleSearch, 1000);

  const getUsers = async () => {
    setUserError(null);
    setUserLoading(true);
    setUsers([]);

    try {
      const result = await octokit.request("GET /search/users", {
        q: searchTerm,
        per_page: 5,
        headers: {
          accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (result.data.items.length > 0) {
        setUsers(result.data.items);
      } else {
        setUserError(
          `No search result for "${searchTerm}". Please try a different search`
        );
      }
    } catch (error: any) {
      setUserError(error.response.data.message);
    } finally {
      setUserLoading(false);
    }
  };

  const getRepos = async (user: string) => {
    setRepoError(null);
    setRepoLoading(true);
    setRepos([]);

    try {
      const result = await octokit.request("GET /search/repositories", {
        q: `user:${user}`,
        per_page: 100,
        headers: {
          accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (result.data.items.length > 0) {
        setRepos(result.data.items);
      } else {
        setRepoError("No repositories found");
      }
    } catch (error: any) {
      setRepoError(error.response.data.errors[0].message);
    } finally {
      setRepoLoading(false);
    }
  };

  const searchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    debouncedHandleSearch();
  };

  const submitForm = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    getUsers();
  };

  const expandedHandler = (panel: string | number, login: string) => () => {
    setExpanded((prevExpanded) => (prevExpanded === panel ? false : panel));
    getRepos(login);
  };

  useEffect(() => {
    fetchPopularUsers();
  }, []);

  const fetchPopularUsers = async () => {
    try {
      const response = await axios.get(
        "https://api.github.com/search/users?q=followers:>1000&per_page=5"
      );
      if (response.data.items.length > 0) {
        setPopularUsers(response.data.items.map((item: any) => item.login));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [popularUsers, setPopularUsers] = useState<string[]>([]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSnackbarOpen = (message: string) => {
    setSnackbarOpen(true);
    setSnackbarMessage(message);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <AppBar>
          <Toolbar sx={{ justifyContent: "center" }}>
            <Typography>GitHub Repositories Explorer</Typography>
          </Toolbar>
        </AppBar>
        <Box alignContent="center" marginTop={10}>
          <form onSubmit={submitForm}>
            <Stack direction="column" spacing={2}>
              <FormControl fullWidth>
                <Autocomplete
                  freeSolo
                  options={users.map((user) => user.login)}
                  inputValue={searchTerm}
                  onInputChange={(_, value) => setSearchTerm(value)}
                  renderInput={(params) => (
                    <OutlinedInput
                      {...params}
                      name="user"
                      size="small"
                      required
                      placeholder="Enter username"
                      value={searchTerm}
                      onChange={searchHandler}
                      autoComplete="off"
                      sx={{ backgroundColor: "#f5f5f5" }}
                    />
                  )}
                />
              </FormControl>
              <Button type="submit" variant="contained" fullWidth>
                Search
              </Button>
              {!userError && searchTerm && (
                <Typography>Showing users for "{searchTerm}"</Typography>
              )}
              {userError && (
                <Box sx={{ color: "red" }}>
                  <Typography>{userError}</Typography>
                </Box>
              )}
              {userLoading && (
                <Box display="flex" justifyContent="center" my={2}>
                  <Lottie
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: animationData,
                    }}
                    width={100}
                    height={100}
                  />
                </Box>
              )}
              {users?.map((user) => (
                <Accordion
                  elevation={0}
                  disableGutters
                  key={user.id}
                  expanded={expanded === user.id}
                  onChange={expandedHandler(user.id, user.login)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        alt={user.login}
                        src={`https://github.com/${user.login}.png`}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography>{user.login}</Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {repoLoading && (
                        <Box display="flex" justifyContent="center">
                          <Lottie
                            options={{
                              loop: true,
                              autoplay: true,
                              animationData: animationData,
                            }}
                            width={100}
                            height={100}
                          />
                        </Box>
                      )}
                      {repoError ? (
                        <Box sx={{ color: "red" }}>
                          <Typography>{repoError}</Typography>
                        </Box>
                      ) : (
                        repos?.map((repo) => (
                          <Card key={repo.id} sx={{ mt: 2 }}>
                            <CardContent>
                              <Typography variant="h6">{repo.name}</Typography>
                              {repo.description && (
                                <Typography>{repo.description}</Typography>
                              )}
                              <Box display="flex" alignItems="center">
                                <Typography sx={{ mr: 1 }}>
                                  {repo.stargazers_count}
                                </Typography>
                                <StarIcon fontSize="small" color="primary" />
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </form>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
      </Container>
    </>
  );
}

export default SearchUser;
