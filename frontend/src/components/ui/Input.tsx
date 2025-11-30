import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; helper?: string };

const Input: React.FC<Props> = ({ label, helper, className = '', ...rest }) => {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontWeight: 600 }}>{label}</span>}
      <input className={`input ${className}`} {...rest} />
      {helper && <small style={{ color: 'var(--text-muted)' }}>{helper}</small>}
    </label>
  );
};

export default Input;