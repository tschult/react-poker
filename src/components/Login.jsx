import React, { useContext } from 'react';
import { Button, TextField, Card, CardContent, CardActions } from '@material-ui/core';
import { UserContext } from '../UserContext';

function Login(props) {

    const { user, setUser } = useContext(UserContext);

    return (
        <Card>
            <CardContent>
                <TextField id="userInput" label="Name" value={user} onChange={e => setUser(e.target.value)} />
            </CardContent>
            <CardActions>
                <Button onClick={props.onLoginClick}>Beitreten</Button>
            </CardActions>
        </Card>);

}

export default Login;