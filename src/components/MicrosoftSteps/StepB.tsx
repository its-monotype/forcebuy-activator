import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext, openExternalLink } from '../../App';
import { Button } from '../Button/Button';

import { LocalStepContext } from './MicrosoftSteps';

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
          {t('Personal account')}
        </h2>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-white mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 dark:text-white leading-7 tracking-wide">
          {t('Open the Xbox app')} (
          {t(
            "it's installed by default but can also be downloaded from the Microsoft Store"
          )}
          ). {t('Log in to your personal account')}(
          {t('you can create a new Xbox account')}
          <span
            onClick={() =>
              openExternalLink(
                'https://signup.live.com/signup?wa=wsignin1.0&rpsnv=13&rver=7.3.6963.0&wp=MBI_SSL&wreply=https:%2f%2faccount.xbox.com%2fen-us%2faccountcreation%3frtc%3d1%26csrf%3diRRDbBsXHWOzqJoxX9GqJOfUcAQCvJVJSNVhpu9YR0ntJtPfRjwCMjSg4qE1UQC4yx6KIvX4cVItbVhM5kW-6bAyA7o1&id=292543&aadredir=1&contextid=8369C2F0524F361B&bk=1602012918&uiflavor=web&lic=1&mkt=EN-US&lc=1033&uaid=3ba71ae4427e4c300da204fc26106240'
              )
            }
            className="cursor-pointer text-blue-500"
          >
            {' '}
            {t('here')}
          </span>
          ).
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
