import React from 'react';
import { Button, TextField, List, ListItem, ListItemText, ListSubheader, ListItemAvatar, Grid } from '@material-ui/core';

export default class MessageBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { messages: [], currentMsg: "" };
        this.signalRConnection = props.signalRConnection;
        this.user = props.user;
    }

    componentDidMount() {
        this.signalRConnection.on("ReceiveMessage", this.OnReceiveMessage);
    }

    componentWillUnmount() {
        this.signalRConnection.off("ReceiveMessage", this.OnReceiveMessage);
    }

    OnReceiveMessage = (userName, message) => {
        this.setState((state) => {
            var newMessageArray = [...state.messages, { user: userName, message: message }];
            return { messages: newMessageArray };
        });
    }

    SendMessage = () => {
        this.signalRConnection.invoke("SendMessage", this.user, this.state.currentMsg);
        this.setState(() => {
            return { currentMsg: "" }
        });
    }

    OnCurrentMsgChange(msg) {
        this.setState(() => {
            return { currentMsg: msg }
        })
    }

    render() {
        return (
            <Grid container direction="column" justify="flex-end">
                <Grid item>
                    <List>
                        <ListSubheader>MessageBoard</ListSubheader>
                        {this.state.messages.map((msg, idx) => <ListItem><ListItemAvatar>{msg.user}</ListItemAvatar> <ListItemText key={idx} primary={msg.message} /></ListItem>)}
                    </List>
                </Grid>

                <Grid item>
                    <TextField value={this.state.currentMsg} onChange={e => this.OnCurrentMsgChange(e.target.value)} />
                    <Button onClick={() => this.SendMessage()}>Send</Button>
                </Grid>
            </Grid>
        );
    }
}

