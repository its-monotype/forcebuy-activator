import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContext, openExternalLink } from '../../App';
import { Button } from '../Button/Button';

import { LocalStepContext } from './SteamSteps';

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
      <div className="mb-10 text-center">
        <h2 className=" text-lg text-gray-900">{t('The basics')}</h2>
        <h1 className="font-bold text-3xl text-gray-900 mt-2">
          {gameData.name}
        </h1>
        <p className="mt-6 text-gray-900 leading-7 tracking-wide">
          {t(
            'The activation process will not take much time, if you have any difficulties - write to the seller in the chat. Do not forget to leave a review'
          )}
          .
        </p>
        <p className="mt-3 text-gray-900 leading-7 tracking-wide">
          {t(
            'To play, you need the Rockstar Games Launcher which you can download from the'
          )}{' '}
          <span
            onClick={() =>
              openExternalLink(
                'https://socialclub.rockstargames.com/rockstar-games-launcher'
              )
            }
            className="cursor-pointer text-blue-500"
          >
            {t('official website')}
          </span>
          .{' '}
          {t(
            'You just need to install it and you do not need to enter any data'
          )}
          .
        </p>
      </div>
      <Button onClick={onNextStep}>{t('Continue')}</Button>
    </motion.div>
  );
};
