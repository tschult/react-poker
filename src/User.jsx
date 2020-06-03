import React from 'react';
import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    green: {
      color: '#fff',
      backgroundColor: theme.palette.primary.main,
    },
  }));

function User(props) {
    const classes = useStyles();

    return (
        <ListItem key={props.name}>
            <ListItemAvatar>
                <Avatar className={props.isCardLocked ? classes.green : ''}>
                    {props.selectedCard ? <div>{props.selectedCard}</div> : props.isCardLocked ? <LockOutlinedIcon /> : <LockOpenOutlinedIcon />}
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={props.name} />
        </ListItem>
    );

};

export default User;