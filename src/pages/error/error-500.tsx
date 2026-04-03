import React from 'react';

interface ErrorProps {
  statusCode?: number;
  headers?: { [key: string]: string };
  title?: string;
  body?: React.ReactNode | string;
  err?: Error;
  locale?: string;
  defaultLocale?: string;
  basePath?: string;
  unstable_runtime?: boolean;
  unstable_overrides?: {
    /**
     * Override the default error page layout.
     */
    Layout?: React.FC<ErrorProps>;
    /**
     * Override the default error page rendering.
     */
    Renderer?: (props: ErrorProps) => React.ReactNode | string;
  };
}

const ErrorPage: React.FC<ErrorProps> = ({ statusCode }) => {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-white'>
      <h1 className='text-4xl font-bold mb-4'>Oops! Something went wrong.</h1>
      <p className='text-lg mb-4'>
        We are experiencing some technical difficulties and are working to resolve the issue.
      </p>
      <p className='text-lg'>
        Error Code: {statusCode || 'Unknown'}
      </p>
    </div>
  );
};

export default ErrorPage;