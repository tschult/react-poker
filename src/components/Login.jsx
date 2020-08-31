import React, { useContext } from 'react';
import { Button, TextField, Card, CardContent, CardActions, Avatar, makeStyles } from '@material-ui/core';
import { UserContext } from '../contexts/UserContext';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme => ({
    avatar: {
        background: theme.palette.secondary.main,
        margin: theme.spacing(2),
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    button: {
        marginBottom: theme.spacing(2)
    }

})));

function Login(props) {


    const classes = useStyles();
    const { user, setUser } = useContext(UserContext);

    return (
        <Card variant="outlined" >
            <CardContent className={classes.content}>
                <Avatar className={classes.avatar}>
                    <PersonIcon />
                </Avatar>
                <TextField fullWidth id="userInput" label="Name" variant="outlined" value={user} onChange={e => setUser(e.target.value)} />
            </CardContent>
            <CardActions>
                <Button fullWidth variant="contained" color="primary" onClick={props.onLoginClick} className={classes.button}>Beitreten</Button>
            </CardActions>
        </Card>);

}

export default Login;