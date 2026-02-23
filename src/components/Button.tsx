import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded font-semibold ${
        variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
