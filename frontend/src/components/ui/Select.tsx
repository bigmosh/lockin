import React from 'react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

const Select: React.FC<Props> = ({ label, className = '', children, ...rest }) => {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontWeight: 600 }}>{label}</span>}
      <select className={`select ${className}`} {...rest}>{children}</select>
    </label>
  );
};

export default Select;