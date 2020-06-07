import React, { useContext } from 'react';
import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import FreeBreakfastIcon from '@material-ui/icons/FreeBreakfast';
import {makeStyles} from '@material-ui/core/styles';
import { UserContext } from '../contexts/UserContext';

const useStyles = makeStyles((theme) => ({
    green: {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
    },
  }));

function User(props) {
    const classes = useStyles();
    const { user } = useContext(UserContext);

    return (
        <ListItem key={props.name}>
            <ListItemAvatar>
                <Avatar className={props.user.isCardLocked ? classes.green : ''}>
                    {props.user.selectedCard 
                        ? props.user.selectedCard === "Kaffee" 
                            ? <FreeBreakfastIcon />
                            : <div>{props.user.selectedCard}</div> 
                        : props.user.isCardLocked 
                            ? <LockOutlinedIcon /> 
                            : <LockOpenOutlinedIcon />}
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={props.user.name === user ? "Ich" : props.user.name} />
        </ListItem>
    );

};

export default User;