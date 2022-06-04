import Web3 from 'web3';
import Web3Provider, {Connectors, useWeb3Context} from 'web3-react';

import {Modal, ModalContext} from './Modals';

import coinbaseWalletLogo from './images/coinbasewallet.png';
import fortmaticLogo from './images/fortmatic.png';
import metaMaskLogo from './images/metamask.png';
import portisLogo from './images/portis.png';
import walletConnectLogo from './images/walletconnect.png';


const {InjectedConnector, NetworkOnlyConnector} = Connectors;


export const ConnectionProvider = ({children}) => (
  <Web3Provider connectors={{
    MetaMask: new InjectedConnector({
      supportedNetworks: [parseInt(process.env.REACT_APP_NETWORK_ID, 10)],
    }),
    Network: new NetworkOnlyConnector({
      providerURL: process.env.REACT_APP_RPC_URL,
    }),
  }} libraryName="web3.js" web3Api={Web3}>
    {children}
  </Web3Provider>
);


const WalletButton = ({name, logo, connector, onConnect}) => {
  const {setConnector} = useWeb3Context();
  return (
    <button className="btn btn-with-icon" onClick={async () => {
      try {
        await setConnector(connector);
      } catch (e) {
        console.error(e);
        return;
      }
      onConnect();
    }}>
      <span className="btn-with-icon__frame">
        <span className="btn-with-icon__frame-in">
          <span className="btn-with-icon__text">{name}</span>
          <span className="btn-with-icon__icon">
            <img src={logo} alt={name}/>
          </span>
        </span>
      </span>
      <span className="btn-with-icon__arrow-start"></span>
      <span className="btn-with-icon__arrow-end"></span>
    </button>
  );
};


export const WalletModal = () => (
  <ModalContext.Consumer>{({params: [continuation], hideModal}) => (
    <Modal name="wallet" className="modal-wallet" title="Connect to a Wallet">
      <WalletButton
          name="MetaMask"
          logo={metaMaskLogo}
          connector="MetaMask"
          onConnect={() => {
            hideModal();
            continuation?.();
          }}/>
      <WalletButton name="WalletConnect" logo={walletConnectLogo} onConnect={hideModal}/>
      <WalletButton name="Coinbase Wallet" logo={coinbaseWalletLogo} onConnect={hideModal}/>
      <WalletButton name="Fortmatic" logo={fortmaticLogo} onConnect={hideModal}/>
      <WalletButton name="Portis" logo={portisLogo} onConnect={hideModal}/>
      <div className="modal-wallet__help">
        <a href="https://ethereum.org/wallets" target="_blank" rel="noreferrer">
          Learn more about wallets
        </a>
      </div>
    </Modal>
  )}</ModalContext.Consumer>
);


export const ConnectButton = () => {
  const {account} = useWeb3Context();
  if (account) {
    return null;
  }
  return (
    <div className="btn-wallet">
      <ModalContext.Consumer>{({showModal}) => (
        <button className="btn btn-wallet__main-btn" onClick={() => showModal('wallet')}>
          <span className="btn-s__text btn-wallet__text">Connect Wallet</span>
        </button>
      )}</ModalContext.Consumer>
      <div className="btn-wallet__doubling">
        <span className="btn-s__frame"></span>
      </div>
    </div>
  );
};
