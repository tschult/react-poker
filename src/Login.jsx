import React from 'react';
import { Button, TextField, Card, CardContent, CardActions, Typography } from '@material-ui/core';

function Login(props) {

    if (props.isConnected) {
        return (<Typography variant="h6">Angemeldet als {props.user}</Typography>)
    } else{
        return (
            
                <Card>
                    <CardContent>
                        <TextField id="userInput" label="Benutzer" value={props.user} onChange={props.onUserChange} />
                    </CardContent>
                    <CardActions>
                        <Button onClick={props.onLoginClick}>Beitreten</Button>
                    </CardActions>
                </Card>);
    }

    
}

export default Login;