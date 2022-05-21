import {useEffect, useState} from 'react';

import {useWeb3Context} from 'web3-react';

import {abi as CONTROLLER_ABI} from './Controller.json';
import {abi as TOKEN_ABI} from './Token.json';


const DynamicStatus = ({context: {account, library: web3}, token, controller}) => {
  const [show, setShow] = useState(false);
  const [balance, setBalance] = useState(null);
  const [unclaimed, setUnclaimed] = useState(null);
  useEffect(() => {
    (async () => {
      setBalance(null);
      setUnclaimed(null);
      const balance = web3.utils.toBN(await token.methods.balanceOf(account).call());
      if (!balance.cmp(web3.utils.toBN(0))) {
        setShow(false);
        return;
      }
      setBalance(balance);
      setShow(true);
      setUnclaimed(web3.utils.toBN(await controller.methods.getUnclaimedRevenue(account).call()));
    })();
  }, [account, controller, token, web3]);
  if (!show) {
    return null;
  }
  return (
    <>
      <h2>Account Status</h2>
      <p>Greetings, esteemed partner!</p>
      <p>You are connected as: <a href={`https://polygonscan.com/address/${account}`} target="_blank" rel="noreferrer">{account}</a></p>
      {balance ? (
        <p>Your <code>ELOT</code> balance is: {balance.toString()} wei</p>
      ) : null}
      {(unclaimed && unclaimed.cmp(web3.utils.toBN(0))) ? (
        <p>You have unclaimed fees: {unclaimed.toString()} wei &#8211; <button onClick={async () => {
          await controller.methods.withdraw(account, unclaimed).send({from: account});
        }}>withdraw</button></p>
      ) : null}
    </>
  );
};


export const PartnerStatus = () => {
  const context = useWeb3Context();
  if (context.account) {
    const web3 = context.library;
    const token = new web3.eth.Contract(TOKEN_ABI, process.env.REACT_APP_TOKEN_ADDRESS);
    const controller = new web3.eth.Contract(
        CONTROLLER_ABI, process.env.REACT_APP_CONTROLLER_ADDRESS);
    return (
      <DynamicStatus context={context} token={token} controller={controller}/>
    );
  } else {
    return null;
  }
};
