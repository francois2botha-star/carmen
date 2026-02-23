import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="mb-2">
    {label && <label className="block mb-1 font-medium">{label}</label>}
    <input className="border rounded px-3 py-2 w-full" {...props} />
    {props.required && !props.value && <span className="text-red-500 text-xs">Required</span>}
  </div>
);

export default Input;
