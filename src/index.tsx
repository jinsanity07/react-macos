import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Desktop from "~/pages/Desktop";
import Login from "~/pages/Login";
import Boot from "~/pages/Boot";
import { user } from "~/configs";
import {
  applyDocumentTheme,
  getPreferredDarkTheme,
  watchPreferredDarkTheme
} from "~/utils";
import { useStore } from "~/stores";

import "@unocss/reset/tailwind.css";
import "uno.css";
import "katex/dist/katex.min.css";
import "~/styles/index.css";

const preferredDark = getPreferredDarkTheme();
applyDocumentTheme(preferredDark);
useStore.setState({ dark: preferredDark });
watchPreferredDarkTheme((dark) => {
  applyDocumentTheme(dark);
  useStore.setState({ dark });
});

export default function App() {
  const [login, setLogin] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string>("jinsanity");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>(user.avatar);
  const [booting, setBooting] = useState<boolean>(false);
  const [restart, setRestart] = useState<boolean>(false);
  const [sleep, setSleep] = useState<boolean>(false);

  const shutMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(false);
    setLogin(false);
    setBooting(true);
  };

  const restartMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(true);
    setSleep(false);
    setLogin(false);
    setBooting(true);
  };

  const sleepMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(true);
    setLogin(false);
    setBooting(true);
  };

  if (booting) {
    return <Boot restart={restart} sleep={sleep} setBooting={setBooting} />;
  } else if (login) {
    return (
      <Desktop
        setLogin={setLogin}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        shutMac={shutMac}
        sleepMac={sleepMac}
        restartMac={restartMac}
      />
    );
  } else {
    return (
      <Login
        setLogin={setLogin}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        setCurrentUserName={setCurrentUserName}
        setCurrentUserAvatar={setCurrentUserAvatar}
        shutMac={shutMac}
        sleepMac={sleepMac}
        restartMac={restartMac}
      />
    );
  }
}

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
