import React, { useState, useContext, useEffect } from 'react';
import { Button, List, CircularProgress } from '@material-ui/core';
import User from './User';
import { UserContext } from '../UserContext';
import { ConnectionContext } from '../ConnectionContext';

function UserList() {
    const [users, setUsers] = useState([]);

    const { user } = useContext(UserContext);
    const { signalRConnection } = useContext(ConnectionContext);

    // Receive User Status Change
    useEffect(() => {
        const OnUserStatusChange = (userName, lockedIn) => {
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
        signalRConnection && signalRConnection.on("ReceiveStatus", OnUserStatusChange);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveStatus", OnUserStatusChange)
        }
    }, [users, signalRConnection]);

    // Receive User Card Reveal
    useEffect(() => {
        const OnReceiveCard = (userName, c) => {
            console.log(userName + " hat die Karte " + c + " gewählt");
            setUsers(users.map(u => {
                return u.name === userName ? { ...u, selectedCard: c } : u;
            }));
        }
        signalRConnection && signalRConnection.on("ReceiveCard", OnReceiveCard);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveCard", OnReceiveCard)
        }
    }, [users, signalRConnection]);

    // New Round started
    useEffect(() => {
        const OnReceiveStart = (userName, newCards) => {
            setUsers(users.map(u => { return {...u, selectedCard: null}}));
        };

        signalRConnection && signalRConnection.on("ReceiveStart", OnReceiveStart);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveStart", OnReceiveStart)
        }
    }, [users, signalRConnection]);



    const HandleStartClick = () => {
        var allowedCards = ["1", "2", "3", "5", "8", "13", "Kaffee"];

        signalRConnection.invoke("StartRound", user, allowedCards).catch(function (err) {
            return console.error(err.toString());
        });
    }
    const HandleStopClick = () => {
        signalRConnection.invoke("EndRound", user);
    }

    if (!signalRConnection)
        return <CircularProgress/>

    return (
        <>
            <Button onClick={HandleStartClick}>Start</Button>
            <Button onClick={HandleStopClick}>Stop</Button>

            <List>
                {users.map((u, idx) => <User key={idx} user={u} />)}
            </List>
        </>
    );
}

export default UserList;