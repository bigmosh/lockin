import React from 'react';

type CardProps = {
  children?: React.ReactNode;
  className?: string;
  raiseOnHover?: boolean;
};

const Card: React.FC<CardProps> = ({ children, className = '', raiseOnHover = false }) => {
  const cls = `card ${raiseOnHover ? 'raise' : ''} ${className}`.trim();
  return <div className={cls}>{children}</div>;
};

export default Card;