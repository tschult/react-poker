import React, { useState, useMemo } from 'react';
import { CssBaseline, Grid, Paper, ThemeProvider, Container, AppBar, Toolbar, Typography } from '@material-ui/core';
import Login from './components/Login';
import * as signalR from '@aspnet/signalr';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { teal } from '@material-ui/core/colors';
import { UserContext } from './UserContext';
import UserList from './components/UserList';
import { ConnectionContext } from './ConnectionContext';
import CardSelection from './components/CardSelection';
import StyleIcon from '@material-ui/icons/Style';


/*
{
  "Tino": false,
  "Paul": true
}

[
  {
    "name": "tino",
    "isCardLocked": false,
    "connectionId": "asdfgg",
    selectedCard: "1"
  },
  {}
]

[
  {"tino" : false},
  {"paul": true}
]
*/



const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2)
  },
  menuIcon: {
    marginRight: theme.spacing(4)
  }
}));

function App() {

  const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: teal,
      secondary: teal,
    }
  });
  const classes = useStyles();

  const [user, setUser] = useState('');
  const userValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  const [signalRConnection, setSignalRConnection] = useState(null);
  const connectionValue = useMemo(() => ({ signalRConnection, setSignalRConnection }), [signalRConnection, setSignalRConnection]);

  var [isLoggedIn, setIsLoggedIn] = useState(false);

  const onLoginClick = async () => {
    if (!user) return;
    setIsLoggedIn(true);
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/pokerHub")
      .build();
    await connection.start();
    setSignalRConnection(connection);
    connection.invoke("Enter", user);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContext.Provider value={userValue}>
        <ConnectionContext.Provider value={connectionValue}>
          <AppBar position="static">
            <Toolbar>
              <StyleIcon className={classes.menuIcon} />
              <Typography variant="h6">Planning Poker</Typography>
            </Toolbar>
          </AppBar>
          <Container>
            {!isLoggedIn &&
              <Grid container justify="center" alignItems="center" spacing={4}>
                <Grid item xs={12} md={6} lg={3} >
                  <Login onLoginClick={onLoginClick} />
                </Grid>
              </Grid>
            }
            {isLoggedIn &&
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper className={classes.paper}>
                    <UserList />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6} >
                  <Paper className={classes.paper}>
                    <CardSelection />
                  </Paper>
                </Grid>
              </Grid>
            }
          </Container>
        </ConnectionContext.Provider>
      </UserContext.Provider>
    </ThemeProvider>

  );
}

export default App;
