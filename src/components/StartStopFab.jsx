import React from 'react';
import { Fab, Zoom, withStyles } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

const styles = theme => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }

});

class StartStopFab extends React.Component {
    constructor(props) {
        super(props);
        this.signalRConnection = props.signalRConnection;
        this.user = props.user;

        this.state = {
            isRoundStarted: false,
            roundStartedBy: null
        }
    }

    componentDidMount() {
        this.signalRConnection.on("ReceiveStart", this.OnReceiveStart);
        this.signalRConnection.on("ReceiveEnd", this.OnReceiveEnd);
    }

    componentWillUnmount() {
        this.signalRConnection.off("ReceiveStart", this.OnReceiveStart);
        this.signalRConnection.off("ReceiveEnd", this.OnReceiveEnd);
    }

    OnReceiveStart = (userName) => {
        this.setState(() => ({ isRoundStarted: true, roundStartedBy: userName }));
    }

    OnReceiveEnd = () => {
        this.setState(() => ({ isRoundStarted: false, roundStartedBy: null }));
    }

    HandleStartClick = () => {
        var allowedCards = ["1", "2", "3", "5", "8", "13", "Kaffee"];

        this.signalRConnection.invoke("StartRound", this.user, allowedCards).catch(function (err) {
            return console.error(err.toString());
        });
    }

    HandleStopClick = () => {
        this.signalRConnection.invoke("EndRound", this.user);
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Zoom in={!this.state.isRoundStarted}>
                    <Fab className={classes.fab} color="primary" onClick={this.HandleStartClick}>
                        <PlayArrowIcon />
                    </Fab>
                </Zoom>
                <Zoom in={this.state.isRoundStarted}>
                    <Fab className={classes.fab} disabled={this.state.roundStartedBy !== this.user} onClick={this.HandleStopClick}>
                        <StopIcon />
                    </Fab>
                </Zoom>
            </div>


        );
    }
}

export default withStyles(styles)(StartStopFab);