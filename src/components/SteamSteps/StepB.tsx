import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../App';
import { Button } from '../Button/Button';

import { LocalStepContext } from './SteamSteps';

export const StepB = () => {
  const { onNextStep, onPrevStep } = React.useContext(LocalStepContext);
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
          {t('Common Buyer Mistakes')}
        </h2>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-white mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 dark:text-white leading-7 tracking-wide">
          <span className="font-medium">
            {t('Mistake')} {t('#')}1
          </span>{' '}
          {t(
            'If a dialog box with “cloud saves” appears when starting the game, be sure to turn them off, otherwise you will lose your save'
          )}
          .
        </p>
        <p className="mt-3 text-gray-900 dark:text-white leading-7 tracking-wide">
          <span className="font-medium">
            {t('Mistake')} {t('#')}2
          </span>{' '}
          {t(
            'You cannot be online when the game is running for more than 3-5 minutes. Because, after activation, you only need to run the game in offline mode'
          )}
          .
        </p>
      </div>
      <div className="flex items-center justify-between space-x-2.5">
        <Button color="gray" onClick={onPrevStep} className="w-full">
          {t('Back')}
        </Button>
        <Button onClick={onNextStep} className="w-full">
          {t('Continue')}
        </Button>
      </div>
    </motion.div>
  );
};
