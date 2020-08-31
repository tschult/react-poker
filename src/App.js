import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { CssBaseline, Grid, Paper, ThemeProvider, Container, AppBar, Toolbar, Typography, CircularProgress, IconButton, useMediaQuery, Drawer, Divider } from '@material-ui/core';
import Login from './components/Login';
import * as signalR from '@aspnet/signalr';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { teal } from '@material-ui/core/colors';
import { UserContext } from './contexts/UserContext';
import UserList from './components/UserList';
import { ConnectionContext } from './contexts/ConnectionContext';
import CardSelection from './components/CardSelection';
import StyleIcon from '@material-ui/icons/Style';
import StartStopFab from './components/StartStopFab';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChatIcon from '@material-ui/icons/Chat';
import InstallPWAButton from './components/InstallPWAButton';
import { deDE } from '@material-ui/core/locale';
import MessageBoard from './components/MessageBoard';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  paper: {
    padding: theme.spacing(2)
  },
  menuIcon: {
    marginRight: theme.spacing(4)
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  appBar: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  }
}));

function App() {


  const classes = useStyles();

  const [user, setUser] = useState('');
  const userValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  const [signalRConnection, setSignalRConnection] = useState(null);
  const connectionValue = useMemo(() => ({ signalRConnection, setSignalRConnection }), [signalRConnection, setSignalRConnection]);

  var [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [useDarkMode, setUseDarkMode] = useState(useMediaQuery('(prefers-color-scheme: dark)'));
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: useDarkMode ? 'dark' : 'light',
          primary: teal,
          secondary: teal,
        }
      }, deDE), [useDarkMode]);

  const onLoginClick = async () => {
    if (!user) return;
    setIsLoggedIn(true);
    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://tspp-signalr.azurewebsites.net/pokerHub")
        .build();
      connection.onclose(async () => {
        await start(connection);
      })
      await start(connection);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  async function start(connection) {
    try {
      await connection.start();
      setSignalRConnection(connection);
      connection.invoke("Enter", user);
    } catch (err) {
      setTimeout(() => start(connection), 5000);
    }
  }

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContext.Provider value={userValue}>
        <ConnectionContext.Provider value={connectionValue}>
          <div className={classes.appBar}>
            <AppBar position="fixed">
              <Toolbar >
                <StyleIcon className={classes.menuIcon} />
                <Typography variant="h6" className={classes.title}>Planning Poker</Typography>
                <IconButton color="inherit" onClick={() => setUseDarkMode(!useDarkMode)}>
                  {useDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <InstallPWAButton />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerOpen}
                  className={clsx(isDrawerOpen && classes.hide)}
                >
                  <ChatIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Toolbar />
          </div>
          <div className={classes.root}>
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
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper className={classes.paper}>
                      {signalRConnection ? <UserList signalRConnection={signalRConnection} user={user} /> : <CircularProgress />}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={8} >
                    <Paper className={classes.paper}>
                      {signalRConnection ? <CardSelection signalRConnection={signalRConnection} user={user} /> : <CircularProgress />}
                    </Paper>
                  </Grid>
                </Grid>
              }
            </Container>
            {signalRConnection && <StartStopFab className={classes.fab} signalRConnection={signalRConnection} user={user} />}
          </div>
          {isLoggedIn && signalRConnection && <Drawer variant="persistent" open={isDrawerOpen} anchor="right" >
            <div className={classes.drawerHeader}>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </div>
            <Divider />
            <MessageBoard signalRConnection={signalRConnection} user={user} />

          </Drawer>}
        </ConnectionContext.Provider>
      </UserContext.Provider>
    </ThemeProvider>

  );
}

export default App;
