import React, { useState, useContext, useEffect } from 'react';
import { ConnectionContext } from '../ConnectionContext';
import { UserContext } from '../UserContext';
import { RadioGroup, FormControlLabel, Radio, Button, CircularProgress, Typography } from '@material-ui/core';

function CardSelection() {
    const [cards, setCards] = useState([]);
    const [isRoundStarted, setIsRoundStarted] = useState(false);
    const [isCardLocked, setIsCardLocked] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const { signalRConnection } = useContext(ConnectionContext);
    const { user } = useContext(UserContext);

    //Receive Start
    useEffect(() => {
        const OnReceiveStart = (userName, newCards) => {
            console.log(userName + " hat eine neue Runde gestartet. Mögliche Karten sind: " + newCards);
            setCards(newCards);
            setIsRoundStarted(true);
            signalRConnection.invoke("SendStatus", user, false);
        }

        signalRConnection && signalRConnection.on("ReceiveStart", OnReceiveStart);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveStart", OnReceiveStart)
        }
    }, [signalRConnection, user]);

    //ReceiveEnd
    useEffect(() => {
        const OnReceiveEnd = (userName) => {
            console.log(userName + " hat die Runde beendet");
            if (isCardLocked) {
                signalRConnection.invoke("RevealCard", user, selectedCard);
                
            }
            setIsCardLocked(false);

            setSelectedCard('');
            setCards([]);
            setIsRoundStarted(false);
        }
        signalRConnection && signalRConnection.on("ReceiveEnd", OnReceiveEnd);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveEnd", OnReceiveEnd)
        }
    }, [signalRConnection, isCardLocked, user, selectedCard]);

    // Receive New User => send my status
    useEffect(() => {
        const OnReceiveNewUser = () => {
            console.log(user + " ist beigetreten.");
            signalRConnection.invoke("SendStatus", user, isCardLocked);
        }

        signalRConnection && signalRConnection.on("ReceiveNewUser", OnReceiveNewUser);
        return function cleanup() {
            signalRConnection && signalRConnection.off("ReceiveNewUser", OnReceiveNewUser)
        }
    }, [signalRConnection, isCardLocked, user]);

    const handleRadioChange = (evt) => {
        setSelectedCard(evt.target.value);
    };

    const HandleLockClick = () => {
        setIsCardLocked(true);
        signalRConnection.invoke("SendStatus", user, true);
    }
    const HandleUnlockClick = () => {
        setIsCardLocked(false);
        signalRConnection.invoke("SendStatus", user, false);
    }

    if (!signalRConnection)
        return <CircularProgress />

    if (!isRoundStarted)
        return <Typography>... keine Runde gestartet</Typography>

    return (
        <>
            <RadioGroup value={selectedCard} onChange={handleRadioChange}>
                {cards.map(card => <FormControlLabel key={card} label={card} value={card} control={<Radio />} />)}
            </RadioGroup>
            {!isCardLocked && selectedCard && <Button onClick={HandleLockClick}>Bestätigen</Button>}
            {isCardLocked && <Button onClick={HandleUnlockClick}>Zurücksetzen</Button>}
        </>
    );

};

export default CardSelection;