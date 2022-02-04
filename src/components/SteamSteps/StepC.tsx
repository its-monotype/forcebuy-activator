import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../App';
import { startSteamActivation } from '../../core/requests';
import { Button } from '../Button/Button';

import { LocalStepContext } from './SteamSteps';

export const StepC = () => {
  const { onPrevStep } = React.useContext(LocalStepContext);
  const { gameData, setStep, setActivationData } = React.useContext(
    MainContext
  );

  const { t } = useTranslation();

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

  const onClickNext = async () => {
    await startSteamActivation({
      login: gameData.login,
      password: gameData.password,
      sharedSecret: gameData.sharedSecret,
      successCallback: (response) => {
        // Success
        console.log(response.data);
        setActivationData({ status: 'success', errorCode: null });
        setStep('FinalStep');
      },
      errorCallback: (error) => {
        // Error
        setActivationData({
          status: 'error',
          errorCode: error.response.data.message,
        });
        setStep('FinalStep');
      },
    });
  };
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="mb-14 text-left">
        <h2 className=" text-lg text-gray-900 dark:text-white">
          {t('Gaining access')}
        </h2>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-white mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 dark:text-white leading-7 tracking-wide">
          {t(
            'Logging into our account is carried out without your intervention and is needed to gain access to the game. During activation, do not interact with the PC to rule out problems'
          )}
          .
        </p>
      </div>
      <div className="flex items-center justify-between space-x-2.5">
        <Button color="gray" onClick={onPrevStep} className="w-full">
          {t('Back')}
        </Button>
        <Button onClick={onClickNext} className="w-full">
          {t('Get Started')}
        </Button>
      </div>
    </motion.div>
  );
};
