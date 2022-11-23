import Head from 'next/head'
import styles from '../styles/Home.module.css';
import { useState, useEffect, useRef } from 'react';
import Web3Modal from 'web3modal';
import { providers, Contract } from 'ethers';
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import { Web3Provider } from '@ethersproject/providers';

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);

  const [loading, setLoading] = useState(false);

  const [isJoinedWhitelist, setIsJoinedWhitelist] = useState(false);

  const [numberOfWhitelisted, setNumberofWhitelisted] = useState(0);

  const web3ModalRef = useRef();

 const getProviderOrSigner = async (needSigner = false) => {

  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider)

  const { chainId } = await web3Provider.getNetwork();


  if(chainId !== 5) {
    window.alert('change network to Goerli')
    throw new Error('change network to Goerli')
  }

  if(needSigner) {
    const signer = web3Provider.getSigner()
    return signer
  }

  return web3Provider
 }


 const addAddressToWhitelist = async () => {
  try {
    const signer = await getProviderOrSigner(true);

    const whitelistContract = new Contract ( 
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    )

    const tx = await whitelistContract.whitelistAddress()

    setLoading(true)

    await tx.wait()

    setLoading(false)

    await getNumberOfWhitelisted()

    setIsJoinedWhitelist(true)

  } catch(err) {
    console.log(err)
  }

 };


 const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract( 
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      provider
      )

    const _numberOfWhitelistedAddresses = await whitelistContract.numAddressesWhitelisted()
    setNumberofWhitelisted(_numberOfWhitelistedAddresses)

  } catch (err) {
    console.error(err);
  }

 }

  const checkIfAddressWhitelisted = async () => {
  try {
    const signer = await getProviderOrSigner(true)


    const whitelistContract = new Contract(
    WHITELIST_CONTRACT_ADDRESS,
    abi,
    signer
  );

  const address = await signer.getAddress()


  const _joinedWhitelist = whitelistContract.whitelistedAddresses(address)
    setIsJoinedWhitelist(_joinedWhitelist)

    } catch(err) {
      console.log(err)
    }
  }

  const connectWallet = async () => {
  try{
    await getProviderOrSigner()
  setWalletConnected(true)

  checkIfAddressWhitelisted()
  getNumberOfWhitelisted()
  } catch (err) {
    console.log(err)
  }
  }

 const renderButton = () => {
  if(walletConnected) {
    if(isJoinedWhitelist) {
      return (
        <div className={styles.description}>
          Thanks for joining the whitelist
        </div>
      )
    } else if(loading) {
      return <button className={styles.button}>Loading...</button>;
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
        </button>
      )
    }

  } else {
    return (
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
    );
  }
 }


 useEffect(() => {
  if(!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false
    })
    connectWallet()
  }
 }, [walletConnected])




  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )

  
}
