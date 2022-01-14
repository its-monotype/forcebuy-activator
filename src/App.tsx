import './App.global.css';
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ipcRenderer } from 'electron';

// Steps
import { LoginStep } from './components/Steps/LoginStep';
import { MicrosoftSteps } from './components/MicrosoftSteps/MicrosoftSteps';
import { SteamSteps } from './components/SteamSteps/SteamSteps';
import { FinalStep } from './components/Steps/FinalStep';

const stepsComponents = {
  LoginStep,
  MicrosoftSteps,
  SteamSteps,
  FinalStep,
};

export type Key = {
  hwid: string;
  value: string;
  status: number;
  ip: string;
};

export type Game = {
  name: string;
  service: string;
  login: string;
  password: string;
  email: string;
  emailPassword: string;
  secondEmail: string;
  secondEmailPassword: string;
  sharedSecret: string;
};

export type Activation = {
  status: string;
  errorCode?: string;
};

type MainContextProps = {
  setStep: React.Dispatch<React.SetStateAction<string>>;
  setKeyData: React.Dispatch<React.SetStateAction<Key>>;
  setGameData: React.Dispatch<React.SetStateAction<Game>>;
  setActivationData: React.Dispatch<React.SetStateAction<Activation>>;
  step: string;
  keyData: Key;
  gameData: Game;
  activationData: Activation;
};

export const MainContext = React.createContext<MainContextProps>(
  {} as MainContextProps
);

export const openExternalLink = (url: string) => {
  ipcRenderer.send('hyperlink', url);
};

function App() {
  const [step, setStep] = React.useState<string>('LoginStep');
  const Step = stepsComponents[step];
  const [keyData, setKeyData] = React.useState<Key>();
  const [gameData, setGameData] = React.useState<Game>();
  const [activationData, setActivationData] = React.useState<Activation>();

  return (
    <MainContext.Provider
      value={{
        step,
        keyData,
        gameData,
        activationData,
        setStep,
        setKeyData,
        setGameData,
        setActivationData,
      }}
    >
      <div className="p-8">
        <AnimatePresence>
          <Step />
        </AnimatePresence>
      </div>
    </MainContext.Provider>
  );
}

export default App;
