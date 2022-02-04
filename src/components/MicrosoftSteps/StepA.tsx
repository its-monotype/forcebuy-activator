import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../App';
import { Button } from '../Button/Button';

import { LocalStepContext } from './MicrosoftSteps';

export const StepA = () => {
  const { onNextStep } = React.useContext(LocalStepContext);
  const { gameData } = React.useContext(MainContext);
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
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="mb-14 text-left">
        <h2 className=" text-lg text-gray-900 dark:text-white">
          {t('The basics')}
        </h2>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-white mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 dark:text-white leading-7 tracking-wide">
          {t(
            "Make sure you have the latest version of Windows 10 or Windows 11, it doesn't hurt to check for updates. Change account data Microsoft Store is prohibited. Our account is only needed to access the game. All game statistics, nickname, etc. are linked to your account Xbox"
          )}
          .
        </p>
      </div>
      <Button onClick={onNextStep}>{t('Continue')}</Button>
    </motion.div>
  );
};
