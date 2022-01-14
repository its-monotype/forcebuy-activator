import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../App';
import { startMicrosoftActivation } from '../../core/requests';
import { Button } from '../Button/Button';

import { LocalStepContext } from './MicrosoftSteps';

export const StepC = () => {
  const { onPrevStep } = React.useContext(LocalStepContext);
  const { gameData, setStep, setActivationData } = React.useContext(
    MainContext
  );

  const { t } = useTranslation();

  const onClickNext = async () => {
    await startMicrosoftActivation({
      login: gameData.login,
      password: gameData.password,
      email: gameData.email,
      emailPassword: gameData.emailPassword,
      secondEmail: gameData.secondEmail,
      secondEmailPassword: gameData.secondEmailPassword,

      successCallback: (response) => {
        // Success
        console.log('startMicrosoftActivation response:', response.data);
        setActivationData({ status: response.data.message });
        setStep('FinalStep');
      },
      errorCallback: (error) => {
        // Error
        console.log('startMicrosoftActivation response:', error.response);
        setActivationData({
          status: 'error',
          errorCode: error.response.data.message,
        });
        setStep('FinalStep');
      },
    });
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
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="mb-10 text-center">
        <h2 className=" text-lg text-gray-900">{t('Gaining access')}</h2>
        <h1 className="font-bold text-3xl text-gray-900 mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 leading-7 tracking-wide">
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
        <Button onClick={onClickNext}>{t('Get Started')}</Button>
      </div>
    </motion.div>
  );
};
