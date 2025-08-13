declare module 'react-circle-flags' {
  import React from 'react';
  
  interface CircleFlagProps {
    countryCode: string;
    height?: string | number;
    className?: string;
  }
  
  export const CircleFlag: React.FC<CircleFlagProps>;
}