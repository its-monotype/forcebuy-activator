import clsx from 'clsx';
import React from 'react';

const colors = {
  green: 'bg-green-800',
  gray:
    'bg-gray-800 hover:bg-gray-700 focus:ring-gray-200 dark:focus:ring-gray-800',
};

const types = {
  submit: 'submit',
  button: 'button',
};

interface ButtonProps {
  disabled?: boolean;
  color?: keyof typeof colors;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: keyof typeof types;
  icon?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  color,
  onClick,
  className,
  type = 'button',
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      className={clsx(
        className,
        'w-full text-white py-3 px-8 rounded-lg font-medium text-lg focus:outline-none focus:ring-2 transition-colors duration-200',
        colors[color] ||
          'bg-blue-500 hover:bg-blue-600 focus:ring-blue-200 dark:focus:ring-blue-500'
      )}
      disabled={disabled}
    >
      {children}
      {icon && (
        <svg
          height="26"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      )}
    </button>
  );
};
