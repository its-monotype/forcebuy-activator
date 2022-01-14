import { ipcRenderer } from 'electron';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../App';
import {
  startMicrosoftActivation,
  startSteamActivation,
} from '../../core/requests';
import { Button } from '../Button/Button';

export const FinalStep = () => {
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [errorCode, setErrorCode] = React.useState<string>('');
  const [isWindowsHello, setIsWindowsHello] = React.useState<boolean>(false);
  const { activationData, gameData } = React.useContext(MainContext);

  const { t } = useTranslation();

  React.useEffect(() => {
    if (activationData.status === 'success') {
      console.log('Успешная активация');
      setIsSuccess(true);
    }
    if (activationData.status === 'windowshello') {
      console.log('Успешная активация');
      setIsSuccess(true);
      setIsWindowsHello(true);
    }
    if (activationData.status === 'error') {
      console.log('Ошибка во время активации');
      setIsError(true);
      setErrorCode(activationData.errorCode);
    }
  }, []);

  const tryAgain = async () => {
    if (gameData.service === 'Microsoft') {
      await startMicrosoftActivation({
        login: gameData.login,
        password: gameData.password,
        email: gameData.email,
        emailPassword: gameData.emailPassword,
        successCallback: (response) => {
          // Success
          if (response.data.message === 'success') {
            setIsSuccess(true);
            setIsWindowsHello(false);
          }
          if (response.data.message === 'windowshello') {
            setIsWindowsHello(true);
          }
        },
        errorCallback: (error) => {
          // Error
          console.log(error);
          setIsError(true);
          setErrorCode(error.response.data.message);
        },
      });
    }
    if (gameData.service === 'Steam') {
      await startSteamActivation({
        login: gameData.login,
        password: gameData.password,
        sharedSecret: gameData.sharedSecret,
        successCallback: (response) => {
          // Success
          console.log(response.data);
          setIsSuccess(true);
        },
        errorCallback: (error) => {
          console.log(error);
          setIsError(true);
        },
      });
    }
    return null;
  };

  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  return isSuccess ? (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="mb-10 text-center">
        <h2 className="font-medium text-xl text-gray-900">{t('Success')}!</h2>
        <h1 className="font-bold text-3xl text-gray-900 mt-2">
          {gameData.name}
        </h1>
        {gameData.service === 'Microsoft' && isWindowsHello && (
          <p className="mt-6 text-gray-900 leading-7 tracking-wide">
            {t('Enter Windows Hello code in MS Store (PINCODE from your PC)')}.
          </p>
        )}
        {gameData.service === 'Microsoft' ? (
          <p className="mt-6 text-gray-900 leading-7 tracking-wide">
            {t(
              'Then you can close this window, find the game in the search, put the game on download, wait for the download and enjoy the gameplay'
            )}
            .
          </p>
        ) : (
          <p className="mt-3 text-gray-900 leading-7 tracking-wide">
            {t(
              'Then you can close this window, find the game in the library, put the game on download, wait for the game to load, switch Steam to offline mode, start the game and enjoy the gameplay'
            )}
            .
          </p>
        )}
      </div>
      <Button
        onClick={() => {
          ipcRenderer.send('close-me');
        }}
      >
        {t('Done')}
      </Button>
    </motion.div>
  ) : isError ? (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="text-center font-bold text-gray-900 text-2xl mb-10">
        {t('Error')} <br />
        {t('Error code')}: {errorCode}. {t('Try Again or write to the seller')}.
      </div>
      <Button onClick={tryAgain}>{t('Try again')}</Button>
    </motion.div>
  ) : (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="text-center font-bold text-gray-900 text-2xl mb-10">
        {t('Unknown Error')}
      </div>
    </motion.div>
  );
};
