import React, { useEffect, useState } from "react";
import { IconButton } from "@material-ui/core";
import GetAppIcon from '@material-ui/icons/GetApp';

const InstallPWAButton = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("transitionend", handler);
    }, []);

    useEffect(() => {
        const onAppInstalled = e => {
            setSupportsPWA(false);
        }

        window.addEventListener("appinstalled", onAppInstalled);

        return () => window.removeEventListener("appinstalled", onAppInstalled);
    }, []);


    const handleClick = (e) => {
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
        });
    }

    if (!supportsPWA) {
        return null;
    }

    return (
        <IconButton color="inherit" onClick={handleClick}>
            <GetAppIcon />
        </IconButton>
    )

}

export default InstallPWAButton;