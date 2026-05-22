import { PropsWithChildren, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountProvider, AlertProvider, ApiProvider, type AlertTemplateProps } from '@gear-js/react-hooks';
import { AppEnv } from './env';

type ProvidersProps = PropsWithChildren<{
  env: AppEnv;
}>;

export function Providers({ children, env }: ProvidersProps) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider template={AlertTemplate}>
        <ApiProvider initialArgs={{ endpoint: env.endpoint }}>
          <AccountProvider appName="Counter dApp">{children}</AccountProvider>
        </ApiProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}

function AlertTemplate({ alert, close }: AlertTemplateProps) {
  return (
    <div className={`app-alert app-alert-${alert.options.type}`}>
      <div>
        {alert.options.title && <strong>{alert.options.title}</strong>}
        <span>{alert.content}</span>
      </div>
      <button type="button" onClick={close} aria-label="Close alert">
        x
      </button>
    </div>
  );
}
