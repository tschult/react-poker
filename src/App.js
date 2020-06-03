import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid, Paper, List, Radio, RadioGroup, FormControlLabel, ThemeProvider, Button } from '@material-ui/core';
import Login from './Login';
import * as signalR from '@aspnet/signalr';
import User from './User';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { teal } from '@material-ui/core/colors';


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

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5000/pokerHub")
  .build();

const useStyles = makeStyles( (theme) => ({
  paper: {
    padding: theme.spacing(2)
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

  var [user, setUser] = useState('');
  var [isConnected, setIsConnected] = useState(false);
  var [isCardLocked, setIsCardLocked] = useState(false);
  var [users, setUsers] = useState([]);
  var [cards, setCards] = useState([]);
  var [selectedCard, setSelectedCard] = useState('');

  useEffect(() => {
    const OnUserStatusChange = (userName, lockedIn) => {
      console.log(users);
      var newUserArray = [...users];
      var found = newUserArray.find(x => x.name === userName);
      if (found) {
        found.isCardLocked = lockedIn;
        found.selectedCard = '';
      } else {
        newUserArray.push({ name: userName, isCardLocked: lockedIn });
      }
      setUsers(newUserArray);
    }
    connection.on("ReceiveStatus", OnUserStatusChange);
    return function cleanup() {
      connection.off("ReceiveStatus")
    }
  }, [users]);
  useEffect(() => {
    const OnReceiveNewUser = () => {
      console.log(user + " ist beigetreten.");
      connection.invoke("SendStatus", user, isCardLocked);
    }

    connection.on("ReceiveNewUser", OnReceiveNewUser);
    return function cleanup() {
      connection.off("ReceiveNewUser")
    }
  });
  useEffect(() => {
    const OnReceiveStart = (userName, newCards) => {
      console.log(userName + " hat eine neue Runde gestartet. Mögliche Karten sind: " + newCards);
      setCards(newCards);
    }

    connection.on("ReceiveStart", OnReceiveStart);
    return function cleanup() {
      connection.off("ReceiveStart")
    }
  });
  //ReceiveEnd
  useEffect(() => {
    const OnReceiveEnd = (userName) => {
      console.log(userName + " hat die Runde beendet");
      if (isCardLocked){
        connection.invoke("RevealCard", user, selectedCard);
      }
      setIsCardLocked(false);
      setSelectedCard('');
      setCards([]);
    }
    connection.on("ReceiveEnd", OnReceiveEnd);
    return function cleanup() {
      connection.off("ReceiveEnd")
    }
  });
  //ReceiveCard
  useEffect(() => {
    const OnReceiveCard = (userName, c) => {
      console.log(userName + " hat die Karte " + c + " gewählt");
      var newUserArray = [...users];
      var found = newUserArray.find(x => x.name === userName);
      if (found) {
        found.selectedCard = c;
      }
      setUsers(newUserArray);
    }
    connection.on("ReceiveCard", OnReceiveCard);
    return function cleanup() {
      connection.off("ReceiveCard")
    }
  });

  const onUserChange = (evt) => {
    console.log(evt.target.value);
    setUser(evt.target.value);
  }

  const onLoginClick = () => {
    console.log(user);
    connection.start().then(function () {
      setIsConnected(true);
      connection.invoke("Enter", user);

    }).catch(function (err) {
      return console.error(err.toString());
    });


  };

  const handleRadioChange = (evt) => {
    setSelectedCard(evt.target.value);
  };

  const HandleLockClick = () => {
    setIsCardLocked(true);
    connection.invoke("SendStatus", user, true);
  }
  const HandleUnlockClick = () => {
    setIsCardLocked(false);
    connection.invoke("SendStatus", user, false);
  }
  const HandleStartClick = () => {
    var allowedCards = ["1", "2", "3", "5", "8", "13", "Kaffee"];

    connection.invoke("StartRound", user, allowedCards).catch(function (err) {
      return console.error(err.toString());
  });
  }
  const HandleStopClick = () => {
    connection.invoke("EndRound", user);
  }



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Login user={user} onLoginClick={onLoginClick} onUserChange={onUserChange} isConnected={isConnected} />
        </Grid>
        {users.length && 
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Button onClick={HandleStartClick}>Start</Button>
            <Button onClick={HandleStopClick}>Stop</Button>

            <List>
              {users.map((user, idx) => <User key={idx} name={user.name} isCardLocked={user.isCardLocked} selectedCard={user.selectedCard} />)}
            </List>
          </Paper>
        </Grid>}
        {cards.length &&
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <RadioGroup value={selectedCard} onChange={handleRadioChange}>
              {cards.map(card => <FormControlLabel key={card} label={card} value={card} control={<Radio />} />)}
            </RadioGroup>
            {!isCardLocked && selectedCard &&<Button onClick={HandleLockClick}>Bestätigen</Button>}
            {isCardLocked && <Button onClick={HandleUnlockClick}>Zurücksetzen</Button>}
          </Paper>
        </Grid>}
      </Grid>
    </ThemeProvider>

  );
}

export default App;
