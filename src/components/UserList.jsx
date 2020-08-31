import React, { } from 'react';
import { List, ListSubheader, Typography } from '@material-ui/core';
import User from './User';

class UserList extends React.Component {

    constructor(props) {
        super(props);
        this.state = { users: [] };
        this.signalRConnection = props.signalRConnection;
        this.user = props.user;
    }

    componentDidMount() {

        this.signalRConnection.on("ReceiveStatus", this.OnUserStatusChange);

        this.signalRConnection.on("ReceiveCard", this.OnReceiveCard);

        this.signalRConnection.on("ReceiveStart", this.OnReceiveStart);

        this.signalRConnection.on("ReceiveUserDisconnect", this.OnReceiveUserDisconnect)

        this.signalRConnection.on("ReceiveNewUser", this.OnReceiveNewUser)

    }

    componentWillUnmount() {
        this.signalRConnection.off("ReceiveStatus", this.OnUserStatusChange);

        this.signalRConnection.off("ReceiveCard", this.OnReceiveCard);

        this.signalRConnection.off("ReceiveStart", this.OnReceiveStart);
    }

    OnUserStatusChange = (userName, lockedIn) => {
        this.setState((state) => {
            var newUserArray = [...state.users];
            var found = newUserArray.find(x => x.name === userName);
            if (found) {
                found.isCardLocked = lockedIn;
                found.selectedCard = '';
            } else {
                newUserArray.push({ name: userName, isCardLocked: lockedIn });
            }
            return { users: newUserArray };
        });
    }
    OnReceiveCard = (userName, c) => {
        console.log(userName + " hat die Karte " + c + " gewählt");
        this.setState((state) => ({
            users: state.users.map(u => {
                return u.name === userName ? { ...u, selectedCard: c } : u;
            })
        }));
    }
    OnReceiveStart = () => {
        this.setState((state) => ({ users: state.users.map(u => { return { ...u, selectedCard: null } }) }));
    }

    OnReceiveNewUser = (newUser, connectionId) => {
        this.setState((state) => ({ users: [...state.users, { connectionId: connectionId, name: newUser, isCardLocked: false, selectedCard: '' }] }))
    }

    OnReceiveUserDisconnect = (connectionId) => {
        this.setState((state) => ({ users: state.users.filter(user => user.connectionId !== connectionId) }));
    }

    render() {
        return (
            <List>
                <ListSubheader>
                    <Typography>Angemeldete Benutzer</Typography>
                </ListSubheader>
                {this.state.users.sort((a, b) => a.name - b.name).map((u, idx) => <User key={u.name} user={u} />)}
            </List>
        );
    }
}

export default UserList;