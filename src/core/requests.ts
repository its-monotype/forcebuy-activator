import axios from 'axios';
import { ipcRenderer } from 'electron';

const port = ipcRenderer.sendSync('get-port-number');

export interface CallBackFunction extends Function {
  (data: any): void;
}

type SteamActivationProps = {
  login: string;
  password: string;
  sharedSecret: string;
  successCallback: CallBackFunction;
  errorCallback: CallBackFunction;
};

type MicrosoftActivationProps = {
  login: string;
  password: string;
  email: string;
  emailPassword: string;
  secondEmail: string;
  secondEmailPassword: string;
  successCallback: CallBackFunction;
  errorCallback: CallBackFunction;
};

export const startSteamActivation = async ({
  login,
  password,
  sharedSecret,
  successCallback,
  errorCallback,
}: SteamActivationProps): Promise<void> => {
  ipcRenderer.send('create-activation-window');
  await axios({
    method: 'POST',
    url: `http://localhost:${port}/steam`,
    data: {
      login,
      password,
      sharedSecret,
    },
    headers: { 'Content-type': 'application/json' },
  })
    .then((response) => {
      if (successCallback != null) {
        ipcRenderer.send('close-activation-window');
        successCallback(response);
      }
    })
    .catch((error) => {
      // catch error
      if (errorCallback != null) {
        ipcRenderer.send('close-activation-window');
        errorCallback(error);
      }
    });
};

export const startMicrosoftActivation = async ({
  login,
  password,
  email,
  emailPassword,
  secondEmail,
  secondEmailPassword,
  successCallback,
  errorCallback,
}: MicrosoftActivationProps): Promise<void> => {
  ipcRenderer.send('create-activation-window');
  await axios({
    method: 'POST',
    url: `http://localhost:${port}/microsoft`,
    data: {
      login,
      password,
      email,
      emailPassword,
      secondEmail,
      secondEmailPassword,
    },
    headers: { 'Content-type': 'application/json' },
  })
    .then((response) => {
      if (successCallback != null) {
        ipcRenderer.send('close-activation-window');
        successCallback(response);
      }
    })
    .catch((error) => {
      // catch error
      if (errorCallback != null) {
        ipcRenderer.send('close-activation-window');
        errorCallback(error);
      }
    });
};
