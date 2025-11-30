import React from 'react';

type Props = {
  children?: React.ReactNode;
  variant?: 'default' | 'soft';
};

const PageContainer: React.FC<Props> = ({ children, variant = 'default' }) => {
  return (
    <div className={`page-container ${variant === 'soft' ? 'soft' : ''}`}>{children}</div>
  );
};

export default PageContainer;