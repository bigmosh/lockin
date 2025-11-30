import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const cls = `btn btn-${variant} ${className}`.trim();
  return (
    <button className={cls} {...rest}>{children}</button>
  );
};

export default Button;