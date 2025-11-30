import React from 'react';

type Props = {
  label: string;
  variant?: 'study' | 'build' | 'focus' | 'default';
};

const Chip: React.FC<Props> = ({ label, variant = 'default' }) => {
  const cls = `chip ${variant}`.trim();
  return <span className={cls}>{label}</span>;
};

export default Chip;