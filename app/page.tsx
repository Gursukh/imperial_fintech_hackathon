"use client";


import Image from "next/image";
import { useState, useEffect } from "react";
import MenuButton from "../components/MenuButton";
import CreatePanel from "./windows/create";
import EscrowPanel from "./windows/escrow";
import AnalyticsPanel from "./windows/analytics";
import HistoryPanel from "./windows/history";
import HelpPanel from "./windows/help";
import SettingsPanel from "./windows/settings";
import LogoutPanel from "./windows/logout";
import HomePage from "./windows/home";

export default function Home() {
  const [intro, setIntro] = useState<boolean>(true);
  const [fadeBackground, setFadeBackground] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("-");

  const startIntroAnimation = () => {
    // Start logo animation
    setIntro(false);

    // Fade background after logo finishes moving
    setTimeout(() => {
      setFadeBackground(true);
      // Set home as selected after background fades
      setSelected("home");
    }, 1000); // 1.5s animation + small delay
  };

  const handleSelect = (id: string) => setSelected(id);

  return (

    <main className="relative w-screen h-screen grid grid-cols-[350px_auto] ">

      <div className="h-full min-w-[350px] w-[350px] bg-foreground p-8 px-4 flex flex-col">
        <div 
          className="fixed flex gap-4 items-center mb-12 z-20"
          style={{
            top: intro ? '50%' : '2rem',
            left: intro ? '50%' : '2rem',
            transform: intro ? 'translate(-50%, -50%)' : 'translate(0, 0)',
            transition: 'all 1.5s ease-in-out'
          }}
        >

          <Image src="ship.svg" alt="InShore Logo" width={40} height={40} />
          <h1 className="text-white text-4xl font-black ">InShore</h1>

        </div>

        <div 
          className={`absolute w-screen h-screen bg-black top-0 left-0 z-10 transition-opacity duration-1000 ease-in-out cursor-pointer ${
            fadeBackground ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={startIntroAnimation}
        />

        <p className="text-background mb-4 text-xl font-black mt-24">MENU</p>
        <MenuButton id="home" label="Home" src="house-chimney.svg" selected={selected === "home"} onClick={handleSelect} />
        <MenuButton id="create" label="Create" src="add.svg" selected={selected === "create"} onClick={handleSelect} />
        <MenuButton id="escrows" label="Active Escrows" src="document-signed.svg" selected={selected === "escrows"} onClick={handleSelect} />
        <MenuButton id="analytics" label="Analytics" src="stats.svg" selected={selected === "analytics"} onClick={handleSelect} />
        <MenuButton id="history" label="History" src="time-past.svg" selected={selected === "history"} onClick={handleSelect} />
        <div className="mt-auto" />
        <MenuButton id="help" label="Help" src="interrogation.svg" selected={selected === "help"} onClick={handleSelect} />
        <MenuButton id="settings" label="Settings" src="gears.svg" selected={selected === "settings"} onClick={handleSelect} />
        <MenuButton id="logout" label="Logout" src="sign-out-alt.svg" selected={selected === "logout"} onClick={handleSelect} />

      </div>

      <div className=" h-full">
        {/* Right-hand panel area */}
        {selected === "home" && <HomePage />}
        {selected === "create" && <CreatePanel />}
        {selected === "escrows" && <EscrowPanel />}
        {selected === "analytics" && <AnalyticsPanel />}
        {selected === "history" && <HistoryPanel />}
        {selected === "help" && <HelpPanel />}
        {selected === "settings" && <SettingsPanel />}
        {selected === "logout" && <LogoutPanel />}
      </div>

    </main>
  );
}
