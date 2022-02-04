import React from 'react';

import { StepA } from './StepA';
import { StepB } from './StepB';
import { StepC } from './StepC';

import { MainContext } from '../../App';

const stepsComponents = {
  0: StepA,
  1: StepB,
  2: StepC,
};

type LocalStepContextProps = {
  onNextStep: () => void;
  onPrevStep: () => void;
  step: number;
};

export const LocalStepContext = React.createContext<LocalStepContextProps>(
  {} as LocalStepContextProps
);

export const SteamSteps: React.FC = () => {
  const { keyData } = React.useContext(MainContext);
  const [step, setStep] = React.useState<number>(0);
  const Step = stepsComponents[step];

  React.useEffect(() => {
    console.log(keyData);
  }, []);

  const onNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const onPrevStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <LocalStepContext.Provider value={{ step, onNextStep, onPrevStep }}>
      <div className="px-10 py-6">
        <Step />
      </div>
    </LocalStepContext.Provider>
  );
};
