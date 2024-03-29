import React from 'react';

import { useForm } from 'react-hook-form';
import { MainContext, openExternalLink } from '../../App';
import { Button } from '../Button/Button';
import Axios from '../../core/axios';
import { getHWID } from 'hwid';
import { ipcRenderer } from 'electron';
import { AppWindow, Question } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

type FormData = {
  key: string;
};

export const LoginStep: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [appVersion, setAppVersion] = React.useState<string>('');
  const { setStep, setKeyData, setGameData } = React.useContext(MainContext);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    const getAppVersion = () => {
      //Get the current version
      ipcRenderer.send('app-version');
      ipcRenderer.on('app-version', (event, arg) => {
        ipcRenderer.removeAllListeners('app-version');
        setAppVersion(arg.version);
      });
    };
    getAppVersion();
    keyRef.current.focus();
  }, []);

  const keyRef = React.useRef(null);
  const { ref, ...rest } = register('key', { required: true, minLength: 3 });
  const { t } = useTranslation();

  const onSubmit = handleSubmit(async (data) => {
    const inputValue = data.key;
    console.log(`Input Value: ${inputValue}`);
    try {
      setIsLoading(true);
      const hwid = await getHWID();
      console.log(`HWID: ${hwid}`);
      const { data } = await Axios({
        method: 'POST',
        url: '/auth',
        data: { inputValue, hwid },
        responseType: 'json',
        headers: {
          Accept: 'application/json',
        },
      });
      console.log(data);
      setKeyData(data.keyData);
      setGameData(data.gameData);
      setIsLoading(false);
      setStep(data.gameData.service + 'Steps');
    } catch (error) {
      console.log('Error ' + error.response.data.message);
      const errorType: string = error.response.data.message;
      let errorMsg: string;
      errorType === 'notFound'
        ? (errorMsg = t('NotFoundText'))
        : errorType === 'alreadyLinked'
        ? (errorMsg = t('AlreadyLinkedText'))
        : errorType === 'blocked'
        ? (errorMsg = t('BlockedText'))
        : t('Unknown error');
      setError('key', {
        type: 'manual',
        message: errorMsg,
      });
      setIsLoading(false);
      keyRef.current.focus();
    }
  });

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

  return isLoading ? (
    <div className="w-full text-center font-medium text-gray-900 dark:text-white text-lg">
      {t('Loading')}...
    </div>
  ) : (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="px-12 py-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('Enter the access code')}
        </h2>
        <p className="mt-3 text-gray-900 dark:text-gray-400">
          {t(
            'Use the access code given to you. 1 access code for 1 PC, to reset the binding, write to the seller'
          )}
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="relative w-full mt-10 mb-6">
          <input
            className={`border ${
              errors.key && errors.key.type
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            } focus:border-blue-500 px-4 py-3  placeholder-gray-400 dark:text-gray-100 text-gray-700 bg-white dark:bg-gray-900 rounded-md text-base focus:outline-none w-full transition-colors ease-out duration-200`}
            {...rest}
            placeholder={t('Access code')}
            type="text"
            spellCheck="false"
            maxLength={38}
            name="key"
            ref={(e) => {
              ref(e);
              keyRef.current = e; // you can still assign to ref
            }}
          />
          {errors.key && errors.key.type === 'manual' && (
            <span className="flex items-center font-medium text-red-500 text-sm mt-2 ml-1">
              {errors.key.message}
            </span>
          )}
          {errors.key && errors.key.type === 'required' && (
            <span className="flex items-center font-medium text-red-500 text-sm mt-2 ml-1">
              {t('Please enter an access code')}
            </span>
          )}
          {errors.key && errors.key.type === 'minLength' && (
            <span className="flex items-center font-medium text-red-500 text-sm mt-2 ml-1">
              {t('Please enter at least 6 characters')}
            </span>
          )}
        </div>
        <Button disabled={!isValid && isLoading} type="submit">
          {t('Continue')}
        </Button>
      </form>
      <div className="flex items-center justify-between mt-5">
        <div className="text-center sm:text-left whitespace-nowrap">
          <div className="flex items-center transition duration-200 px-3 py-3 font-normal text-sm rounded-lg text-gray-500 dark:text-gray-400 ">
            <AppWindow className="w-5 h-5 inline-block align-text-top" />
            <span className="inline-block ml-1">{appVersion}</span>
          </div>
        </div>
        <div className="text-center sm:text-right whitespace-nowrap">
          <button
            onClick={() =>
              openExternalLink('https://plati.market/seller/olmax03/867871/')
            }
            className="flex items-ceter transition duration-200 px-4 py-3 cursor-pointer font-normal text-sm rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none dark:focus:bg-gray-700 focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-opacity-50 ring-inset"
          >
            <Question className="w-5 h-5 inline-block align-text-bottom" />
            <span className="inline-block ml-1">{t('Help')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
