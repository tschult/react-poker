import React from 'react';
import { Button, Typography, Hidden, GridList, GridListTile, Grow, Avatar, withStyles, ListItem, ListItemIcon, List, ListSubheader } from '@material-ui/core';
import FreeBreakfastIcon from '@material-ui/icons/FreeBreakfast';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    gridList: {
        justify: 'center',
        alignItems: 'stretch'
    },
    avatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        margin: theme.spacing(4)
    },
    selectedAvatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        margin: theme.spacing(4),
        background: theme.palette.primary.main
    },
    selected: {
        background: theme.palette.primary.main
    }

});

class CardSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            isRoundStarted: false,
            isCardLocked: false,
            selectedCard: null
        };
        this.signalRConnection = props.signalRConnection;
        this.user = props.user;
    }

    componentDidMount() {
        this.signalRConnection.on("ReceiveStart", this.OnReceiveStart);
        this.signalRConnection.on("ReceiveEnd", this.OnReceiveEnd);
        this.signalRConnection.on("ReceiveNewUser", this.OnReceiveNewUser);
    }

    componentWillUnmount() {
        this.signalRConnection.off("ReceiveStart", this.OnReceiveStart);
        this.signalRConnection.off("ReceiveEnd", this.OnReceiveEnd);
        this.signalRConnection.off("ReceiveNewUser", this.OnReceiveNewUser);
    }

    OnReceiveStart = (userName, newCards) => {
        console.log(userName + " hat eine neue Runde gestartet. Mögliche Karten sind: " + newCards);
        this.setState(() => ({ cards: newCards, isRoundStarted: true, selectedCard: null, isCardLocked: false }));
        this.signalRConnection.invoke("SendStatus", this.user, false);
    }

    OnReceiveEnd = (userName) => {
        console.log(userName + " hat die Runde beendet");
        if (this.state.isCardLocked) {
            this.signalRConnection.invoke("RevealCard", this.user, this.state.selectedCard);
        }
        this.setState(() => ({
            isCardLocked: false,
            selectedCard: null,
            cards: [],
            isRoundStarted: false
        }))
    }

    OnReceiveNewUser = (newUser) => {
        console.log(newUser + " ist beigetreten.");
        this.signalRConnection.invoke("SendStatus", this.user, this.state.isCardLocked);
    }

    setSelectedCard(card) {
        this.setState(() => ({
            selectedCard: card
        }))
    };

    toggleSelectedCard(card) {
        if (this.state.selectedCard === card) {
            this.setSelectedCard(null);
            this.HandleUnlockClick();
        } else {
            this.setSelectedCard(card);
            this.HandleLockClick();

        }

    }

    HandleLockClick() {
        this.setState(() => ({
            isCardLocked: true
        }))
        this.signalRConnection.invoke("SendStatus", this.user, true);
    }
    HandleUnlockClick() {
        this.setState(() => ({
            isCardLocked: false
        }))
        this.signalRConnection.invoke("SendStatus", this.user, false);
    }

    render() {
        const { classes } = this.props;

        if (!this.state.isRoundStarted)
            return (
                <Typography>... keine Runde gestartet</Typography>
            )

        return (
            <div>
                <Hidden mdUp>
                    <List>
                        <ListSubheader><Typography>Wähle eine Karte</Typography></ListSubheader>
                        {this.state.cards.map(card => (
                            <ListItem button key={card} onClick={() => this.toggleSelectedCard(card)} selected={this.state.selectedCard === card}>
                                <ListItemIcon>
                                    <Avatar className={this.state.selectedCard === card ? classes.selected : ""}>
                                        {card === "Kaffee" ? <FreeBreakfastIcon /> : <Typography >{card}</Typography>}
                                    </Avatar>
                                </ListItemIcon>
                            </ListItem>
                        ))}
                    </List>
                </Hidden>
                <Hidden smDown>
                    <div className={classes.root}>
                        <GridList cellHeight={160} cols={3} className={classes.gridList} spacing={2}>
                            {this.state.cards.map(card => (
                                <Grow in={true} key={card}>
                                    <GridListTile  >
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => this.toggleSelectedCard(card)}
                                            color={this.state.selectedCard === card ? "primary" : "default"} >
                                            <Avatar className={this.state.selectedCard === card ? classes.selectedAvatar : classes.avatar} >
                                                {card === "Kaffee" ? <FreeBreakfastIcon /> : <Typography variant="h4" >{card}</Typography>}
                                            </Avatar>

                                        </Button>

                                    </GridListTile>
                                </Grow>
                            ))}

                        </GridList>
                    </div>
                </Hidden>
            </div >
        )
    }
}

export default withStyles(styles)(CardSelection);