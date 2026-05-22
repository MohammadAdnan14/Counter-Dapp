import { Activity, AlertTriangle, CheckCircle2, ChevronDown, Minus, Plus, RefreshCcw, RotateCcw, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useApi, WALLET_STATUS, type Account, type Wallet as VaraWallet } from '@gear-js/react-hooks';
import { getAppEnv } from './env';
import { useCounter } from './hooks/useCounter';
import { Providers } from './providers';

function AppContent() {
  const env = useMemo(getAppEnv, []);

  if (env.missing.length > 0) {
    return <EnvGate missing={env.missing} />;
  }

  return (
    <Providers env={env}>
      <Dashboard endpoint={env.endpoint} programId={env.programId} />
    </Providers>
  );
}

export function App() {
  return <AppContent />;
}

function Dashboard({ endpoint, programId }: { endpoint: string; programId: string }) {
  const { api, isApiReady } = useApi();
  const blockQuery = useQuery({
    queryKey: ['latest-block'],
    enabled: isApiReady,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!api) throw new Error('Gear API is not ready');
      const header = await api.rpc.chain.getHeader();
      return header.number.toNumber();
    },
  });

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Vara Sails</p>
          <h1>Counter dApp</h1>
        </div>
        <ConnectionStatus ready={isApiReady} endpoint={endpoint} blockNumber={blockQuery.data} />
      </section>

      <section className="layout">
        <div className="workspace">
          <CounterPanel programId={programId} isApiReady={isApiReady} />
        </div>
        <aside className="side-panel">
          <WalletPanel />
          <NetworkPanel endpoint={endpoint} blockQuery={blockQuery} />
        </aside>
      </section>
    </main>
  );
}

function EnvGate({ missing }: { missing: string[] }) {
  return (
    <main className="app-shell">
      <section className="empty-state">
        <AlertTriangle aria-hidden="true" />
        <h1>Frontend environment is incomplete</h1>
        <p>Set the required Vite variables before opening the counter screen.</p>
        <div className="missing-list">
          {missing.map((key) => (
            <code key={key}>{key}</code>
          ))}
        </div>
      </section>
    </main>
  );
}

function ConnectionStatus({
  ready,
  endpoint,
  blockNumber,
}: {
  ready: boolean;
  endpoint: string;
  blockNumber?: number;
}) {
  return (
    <div className="connection">
      {ready ? <CheckCircle2 aria-hidden="true" /> : <Activity aria-hidden="true" />}
      <div>
        <span>{ready ? 'Connected' : 'Connecting'}</span>
        <small>{blockNumber ? `#${blockNumber.toLocaleString()} on ${endpoint}` : endpoint}</small>
      </div>
    </div>
  );
}

function CounterPanel({ programId, isApiReady }: { programId: string; isApiReady: boolean }) {
  const counter = useCounter(programId, isApiReady);
  const actionsDisabled = Boolean(counter.disabledReason);
  const readout = counter.isValueLoading ? 'Loading' : (counter.value ?? 0).toLocaleString();

  return (
    <section className="counter-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Program</p>
          <h2>Counter controls</h2>
        </div>
        <code className="program-id">{programId}</code>
      </div>

      <div className="counter-readout">
        <span className="counter-label">Current value</span>
        <strong>{readout}</strong>
        {counter.isValueFetching && !counter.isValueLoading && <small>Refreshing...</small>}
      </div>

      {counter.error && <p className="form-error">{counter.error instanceof Error ? counter.error.message : 'Counter call failed'}</p>}
      {counter.disabledReason && <p className="muted compact">{counter.disabledReason}</p>}
      {counter.status && <p className="status-line">{counter.status}</p>}

      <div className="button-row">
        <button type="button" disabled={actionsDisabled} title={counter.disabledReason} onClick={counter.increment}>
          <Plus aria-hidden="true" />
          +1
        </button>
        <button type="button" disabled={actionsDisabled} title={counter.disabledReason} onClick={counter.decrement}>
          <Minus aria-hidden="true" />
          -1
        </button>
        <button type="button" disabled={actionsDisabled} title={counter.disabledReason} onClick={counter.reset}>
          <RotateCcw aria-hidden="true" />
          Reset
        </button>
        <button type="button" className="secondary-button" onClick={() => void counter.refetch()}>
          <RefreshCcw aria-hidden="true" />
          Refresh
        </button>
      </div>
    </section>
  );
}

function WalletPanel() {
  const { wallets, isAnyWallet, account, isAccountReady, login, logout } = useAccount();
  const walletEntries = Object.values(wallets ?? {});
  const hasWalletsLoaded = wallets !== undefined;

  return (
    <section className="utility-panel">
      <div className="panel-title">
        <Wallet aria-hidden="true" />
        <h2>Wallet</h2>
      </div>

      {!hasWalletsLoaded && <p className="muted">Checking browser extensions...</p>}
      {hasWalletsLoaded && !isAnyWallet && <p className="muted">No Vara-compatible wallet extension found.</p>}

      {walletEntries.length > 0 && (
        <div className="wallet-list">
          {walletEntries.map((wallet) => (
            <WalletConnector key={wallet.id} wallet={wallet} selected={account} onSelect={login} />
          ))}
        </div>
      )}

      {isAccountReady && account && (
        <div className="account-chip">
          <span>{account.meta.name ?? 'Connected account'}</span>
          <small>{shortAddress(account.address)}</small>
          <button type="button" onClick={logout}>
            Disconnect
          </button>
        </div>
      )}
    </section>
  );
}

function WalletConnector({
  wallet,
  selected,
  onSelect,
}: {
  wallet: VaraWallet;
  selected?: Account;
  onSelect: (account: Account) => void;
}) {
  const isConnected = wallet.status === WALLET_STATUS.CONNECTED;

  return (
    <details className="wallet-item">
      <summary>
        <span>{wallet.id}</span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            void wallet.connect();
          }}
        >
          {isConnected ? 'Refresh' : 'Connect'}
        </button>
        <ChevronDown aria-hidden="true" />
      </summary>
      {wallet.accounts?.length ? (
        <div className="account-list">
          {wallet.accounts.map((account) => (
            <button
              type="button"
              key={account.address}
              className={selected?.address === account.address ? 'selected' : ''}
              onClick={() => onSelect(account)}
            >
              <span>{account.meta.name ?? 'Account'}</span>
              <small>{shortAddress(account.address)}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="muted compact">Connect this wallet to list accounts.</p>
      )}
    </details>
  );
}

function NetworkPanel({
  endpoint,
  blockQuery,
}: {
  endpoint: string;
  blockQuery: ReturnType<typeof useQuery<number, Error>>;
}) {
  return (
    <section className="utility-panel">
      <div className="panel-title">
        <Activity aria-hidden="true" />
        <h2>Network</h2>
      </div>
      <dl className="facts">
        <div>
          <dt>Endpoint</dt>
          <dd>{endpoint}</dd>
        </div>
        <div>
          <dt>Latest block</dt>
          <dd>{blockQuery.data ? blockQuery.data.toLocaleString() : 'Waiting...'}</dd>
        </div>
      </dl>
      {blockQuery.error && <p className="form-error">{blockQuery.error.message}</p>}
      <button type="button" className="secondary-button" onClick={() => void blockQuery.refetch()}>
        <RefreshCcw aria-hidden="true" />
        Refresh
      </button>
    </section>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
