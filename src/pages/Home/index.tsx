/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import * as anchor from '@project-serum/anchor';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { useToasts } from 'react-toast-notifications'
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { SolanaClient, SolanaClientProps } from '../../helpers/sol';
import {
  COMMITMENT,
  CLUSTER_API,
  CONFIG,
  POOL_SIGNER_SEEDS,
  VAULT_PDA_SEEDS,
  DECIMAL,
  POOL_SEEDS,
  POOL_DATA_SEEDS,
} from '../../config/index'

import { IDL } from '../../constants/idl/punky_staking'
import './index.css';
import { getAccountInfo, getBlockTime, getRecentBlockHash, getTokenAccountByOwner } from '../../api/api';
import { sendTransactions } from '../../helpers/sol/connection';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import StakedBox from "../../components/StakedBox";
import { getImg } from '../../utils/Helper';
import WalletBox from '../../components/WalletBox';

interface NFTInfo {
  name: string,
  imageUrl: string,
  mint: PublicKey,
  tokenAccount: PublicKey,
  updateAuthority: PublicKey,
  tokenType: Number,
  canClaim: Boolean,
  daysPassed: Number,
  current: Number,
  rewardATA: String,
  tokenTo: String,
}


const HomePage = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { addToast } = useToasts();
  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API } as SolanaClientProps);
  const [loading, setLoading] = useState(false);
  const [walletNfts, setWalletNfts] = useState<any[]>([
  ]);
  const [stakedNfts, setStakedNfts] = useState<any[]>([
  ]);
  const [loadingText, setLoadingText] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [intervalId, setIntervalId] = useState(0);
  const [totalStakedNft, setTotalStakedNft] = useState(0);
  const [splTokenPerDay, setSplTokenPerDay] = useState(0);

  const appName: any = "punky";
  const CONSTANTS: any = CONFIG;
  const PROGRAM_ID = CONSTANTS[appName].PROGRAM_ID;
  const REWARD_TOKEN_ACCOUNT = CONSTANTS[appName].REWARD_TOKEN_ACCOUNT;
  const REWARD_TOKEN_MINT = CONSTANTS[appName].REWARD_TOKEN_MINT;
  const INTERVAL = CONSTANTS[appName].INTERVAL;
  const NFT_UPDATE_AUTHORITY = CONSTANTS[appName].NFT_UPDATE_AUTHORITY;
  const TOTAL_NFT_SUPPLY = CONSTANTS[appName].TOTAL_NFT_SUPPLY;
  const DAYTIME = CONSTANTS[appName].DAYTIME;
  const SPL_TOKEN_PER_DAY = CONSTANTS[appName].SPL_TOKEN_PER_DAY;
  const COLLECTION_NAME = CONSTANTS[appName].COLLECTION_NAME;
  const MINIUM_TOKEN_FOR_STAKING = CONSTANTS[appName].MINIUM_TOKEN_FOR_STAKING;
  const LIFETIME = CONSTANTS[appName].LIFETIME;

  useEffect(() => {
    (async () => {
      if (wallet) {
        setLoading(true);
        setLoadingText('Loading...');
        await reloadNftState()
        setLoading(false);
      }
    })()
  }, [wallet]);

  useEffect(() => {
    (async () => {
      window.clearInterval(intervalId);
      await displayCurrentReward(stakedNfts)
    })()
  }, [stakedNfts])
  // get current state//
  const reloadNftState = async () => {
    if (wallet) {
      await getWalletBalance();
      await getWalletNfts();
      await getStakedNfts();
    }
  }

  const getWalletNfts = async () => {
    if (!wallet) return;
    const pubKey = wallet!.publicKey?.toString();
    let walletNFTs: NFTInfo[] = [];
    let result = await solanaClient.getAllCollectibles([pubKey], [{
      updateAuthority: NFT_UPDATE_AUTHORITY, collectionName: COLLECTION_NAME
    },]);
    if (result[pubKey]) {

      result[pubKey].forEach((nft: any) => {
        if (nft.updateAuthority === NFT_UPDATE_AUTHORITY && nft?.name.includes(COLLECTION_NAME)) {
          walletNFTs.push(
            {
              name: nft.name,
              imageUrl: nft.image,
              mint: new PublicKey(nft.mint),
              tokenAccount: new PublicKey(nft.tokenAccount),
              updateAuthority: new PublicKey(nft.updateAuthority),
              tokenType: 0,
              canClaim: false,
              daysPassed: 0,
              current: 0,
              rewardATA: '',
              tokenTo: '',
            }
          );
        }
      })
      setWalletNfts(walletNFTs);
    }
  }

  const getStakedNfts = async () => {
    if (!wallet) return;
    const provider = getProvider();
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    let stakedNFTs: NFTInfo[] = [];

    let [poolSignerAddr, _nonce_signer] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SIGNER_SEEDS), wallet.publicKey.toBuffer()],
      new PublicKey(program.programId)
    );

    let [poolDataAddr, _nonce_data] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_DATA_SEEDS)],
      new PublicKey(program.programId)
    );

    const data = await program.account.data.fetch(poolDataAddr);
    setTotalStakedNft(data.nftFirst);
    let pubKey = poolSignerAddr.toString();
    let result = await solanaClient.getAllCollectibles([pubKey], [
      { updateAuthority: NFT_UPDATE_AUTHORITY, collectionName: COLLECTION_NAME },]
    );
    if (result[pubKey]) {
      result[pubKey].forEach((nft: any) => {
        if (nft.updateAuthority === NFT_UPDATE_AUTHORITY && nft?.name.includes(COLLECTION_NAME)) {
          stakedNFTs.push(
            {
              name: nft.name,
              imageUrl: nft.image,
              mint: new PublicKey(nft.mint),
              tokenAccount: new PublicKey(nft.tokenAccount),
              updateAuthority: new PublicKey(nft.updateAuthority),
              tokenType: 0,
              canClaim: true,
              daysPassed: 0,
              current: 0,
              rewardATA: '',
              tokenTo: '',
            }
          );
        }
      })
      await updateEachRewards(stakedNFTs);
    }
  }

  const displayCurrentReward = async (stakedNFTs: NFTInfo[]) => {
    if (!wallet) return;

    window.clearInterval(intervalId);
    const newInterval = window.setInterval(async () => {
      await updateEachRewards(stakedNFTs);
    }, INTERVAL);
    setIntervalId(newInterval);
  }
  const updateEachRewards = async (stakedNFTs: NFTInfo[]) => {
    if (!wallet) return;
    try {
      let newStakedNFTs: any[] = stakedNFTs;
      let blockhash = await getRecentBlockHash();
      let currentTimeStamp = await getBlockTime(blockhash.result.context.slot);
      const provider = getProvider();
      const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);

      for (let i = 0; i < newStakedNFTs?.length; i++) {
        let [poolAddr, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from(POOL_SEEDS), wallet!.publicKey.toBuffer(), new PublicKey(newStakedNFTs[i].mint).toBuffer()],
          new PublicKey(program.programId)
        );
        let rewardTokenNumber = 0;
        const poolNft = await program.account.pool.fetch(poolAddr);
        let current = 0;
        let canClaim = true;
        if (poolNft) {
          rewardTokenNumber = poolNft.reward.toNumber() / DECIMAL;
          let dayPassed = Math.floor((currentTimeStamp.result - poolNft.lastTime) / DAYTIME);
          if (dayPassed < 0) dayPassed = 0;
          canClaim = (LIFETIME < (currentTimeStamp.result - poolNft.lastTime));
          current = rewardTokenNumber * dayPassed;
          current = current > 0 ? current : 0;
          newStakedNFTs[i] = {
            ...newStakedNFTs[i],
            current: current,
            daysPassed: dayPassed,
            canClaim: canClaim,
          }
          setSplTokenPerDay(rewardTokenNumber);
        }

      }
      setStakedNfts([...newStakedNFTs]);
    } catch (error) {
      console.log("error while updating reward", error);
    }
  }

  const getWalletBalance = async () => {
    if (wallet) {
      const result: any = await getTokenAccountByOwner(wallet!.publicKey.toString(), REWARD_TOKEN_MINT);
      if (result?.result?.value) {
        const { value } = result.result;
        if (value?.length > 0) {
          let totalBalance = 0;
          value.forEach((v: any) => {
            totalBalance += v.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
          });
          setWalletBalance(totalBalance);
        }
      }

    }
  }

  // for actions such as staking, claiming, unstaking //
  const onStake = async (nft: NFTInfo) => {

    if (walletBalance < MINIUM_TOKEN_FOR_STAKING) {
      addToast("Insufficient token", {
        appearance: 'error',
        autoDismiss: true,
      })
      return;
    }
    setLoading(true);
    setLoadingText('Staking...');

    const provider = getProvider();
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);

    try {
      if (!wallet) {
        addToast("Connect your wallet!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        setLoading(false)
        return;
      }

      let instructionSet = [], signerSet = [];
      let transaction = [];
      let signers: any = [];
      let [poolSigner, nonce_signer] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(POOL_SIGNER_SEEDS), wallet.publicKey.toBuffer()],
        program.programId
      );

      let [pool, nonce_pool] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(POOL_SEEDS), wallet.publicKey.toBuffer(), nft.mint.toBuffer()],
        program.programId
      );

      const { result } = await getAccountInfo(poolSigner.toString());
      if (!result.value) {
        const instruction = await program.instruction.createPoolSigner(nonce_signer, {
          accounts: {
            poolSigner: poolSigner,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        })
        transaction.push(instruction);
      }

      const poolResultInfo = await getAccountInfo(pool.toString());
      if (!poolResultInfo.result.value) {
        const instruction = await program.instruction.createPool(nonce_pool, {
          accounts: {
            pool: pool,
            user: wallet.publicKey,
            mint: nft.mint,
            systemProgram: SystemProgram.programId
          }
        })
        transaction.push(instruction);
      }

      let newTx: any = await makeRewardAta();
      if (newTx.transaction.length !== 0) {
        transaction = [...transaction, ...newTx.transaction];
        signers = [...signers, ...newTx.signers];
      }
      nft.rewardATA = newTx.rewardATA;
      let newStakeTx: any = await makeStakeTx(program, poolSigner, pool, nft);
      if (newStakeTx.transaction?.length !== 0) {
        transaction = [...transaction, ...newStakeTx.transaction];
        signers = [...signers, ...newStakeTx.signers];
      }
      nft.tokenTo = newStakeTx.nftATA.toString();
      instructionSet.push(transaction);
      signerSet.push(signers);
      window.clearInterval(intervalId);
      await sendTransactions(connection, wallet, instructionSet, signerSet);
      let tempTokenAccount = nft.tokenAccount;
      let totalStakedNFT = totalStakedNft + 1;
      setTotalStakedNft(totalStakedNFT);

      let totalBalance = walletBalance - MINIUM_TOKEN_FOR_STAKING;
      setWalletBalance(totalBalance);
      nft.tokenAccount = new PublicKey(nft.tokenTo);
      nft.tokenTo = tempTokenAccount.toString();
      nft.current = 0;
      nft.daysPassed = 0;
      nft.canClaim = false;

      let updatedWalletNfts = walletNfts.filter(walletNft => walletNft.mint !== nft.mint);
      setWalletNfts(updatedWalletNfts);
      setStakedNfts([...stakedNfts, nft]);
      addToast("Staking success!", {
        appearance: 'success',
        autoDismiss: true,
      });
      setLoading(false);

    } catch (error) {
      console.log("error when staking", error);
      addToast('Staking failed!', {
        appearance: 'error',
        autoDismiss: true,
      })
      setLoading(false);
      return;
    }
  }

  const onClaim = async (nft: NFTInfo) => {
    try {
      setLoading(true);
      setLoadingText('Claiming...');
      if (!wallet) {
        addToast("Connect your wallet!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        setLoading(false);
        return;
      }

      let instructionSet: any = [];
      let signerSet: any = [];
      let transaction: any = [];
      let signers = [];
      let tokenResult = await getTokenAccountByOwner(wallet.publicKey.toString(), REWARD_TOKEN_MINT);
      let result = tokenResult.result.value;
      if (result.err) {
        addToast('Claiming failed!', {
          appearance: 'error',
          autoDismiss: true,
        })
        setLoading(false);
        console.log('error to get tokenResult in claiming', result.err)
        return;
      }

      let rewardATA = '';
      if (result.length === 0) {
        let newTx: any = await makeRewardAta();
        signers = [...newTx.signers];
        transaction = [...newTx.transaction];
        rewardATA = newTx.rewardATA;

      } else {
        rewardATA = result[0].pubkey;
      }

      nft.rewardATA = rewardATA;
      let claimTx = await makeClaimTx(nft);
      transaction = [...transaction, ...claimTx]
      instructionSet.push(transaction);
      signerSet.push([]);

      window.clearInterval(intervalId);
      await sendTransactions(connection, wallet, instructionSet, signerSet)

      let wallBalance = walletBalance + (nft.canClaim ? Number(nft.current) : 0);
      setWalletBalance(wallBalance);
      setStakedNfts(stakedNfts.map(stakedNFT => {
        if (stakedNFT.mint === nft.mint) {
          return {
            ...stakedNFT,
            current: 0,
            canClaim: false,
            daysPassed: 0,
          }
        } else {
          return {
            ...stakedNFT,
          }
        }
      }));

      addToast('Claiming success!', {
        appearance: 'success',
        autoDismiss: true,
      });
      setLoading(false);
    } catch (error) {
      addToast('Claiming failed!', {
        appearance: 'error',
        autoDismiss: true,
      });
      setLoading(false);
      console.log('error in claiming', error);
    }
  }

  const onUnstake = async (nft: NFTInfo) => {
    try {
      setLoading(true);
      setLoadingText('Unstaking...');
      if (!wallet) {
        addToast("Connect your wallet!", {
          appearance: 'warning',
          autoDismiss: true,
        })
        return;
      }
      let instructionSet = [];
      let signerSet = [];
      let transaction: any = [];
      let signers: any = [];
      let newTx: any = await makeRewardAta();
      if (newTx.transaction.length !== 0) {
        signers = [...newTx.signers]
        transaction = [...newTx.transaction]
      }
      nft.rewardATA = newTx.rewardATA;

      let unStakeTx = await makeUnstakeTx(nft);
      if (unStakeTx.signers.length !== 0) {
        signers = [...signers, ...unStakeTx.signers];
      }
      transaction = [...transaction, ...unStakeTx.transaction];
      instructionSet.push(transaction);
      signerSet.push(signers);
      window.clearInterval(intervalId);

      await sendTransactions(connection, wallet, instructionSet, signerSet)
      let totalStakedNFT = totalStakedNft - 1;
      setTotalStakedNft(totalStakedNFT);
      let wallBalance = walletBalance + (nft.canClaim ? Number(nft.current) : 0) + MINIUM_TOKEN_FOR_STAKING;
      setWalletBalance(wallBalance);
      let tempTokenAccount = nft.tokenAccount.toString();
      if (!nft.tokenTo) {
        let tokenResult = await getTokenAccountByOwner(wallet.publicKey.toString(), nft.mint.toString());
        nft.tokenTo = tokenResult.result.value[0]?.pubkey.toString();
      }
      nft.tokenAccount = new PublicKey(nft.tokenTo);
      nft.tokenTo = tempTokenAccount;
      nft.canClaim = false;

      setWalletNfts([...walletNfts, nft]);
      setStakedNfts(stakedNfts.filter(NFT => NFT.mint !== nft.mint));
      addToast('Unstaking success!', {
        appearance: 'success',
        autoDismiss: true,
      })
      setLoading(false);
    } catch (error) {
      setLoading(false);
      addToast('Unstaking failed!', {
        appearance: 'error',
        autoDismiss: true,
      });
      console.log('error in Unstaking', error)

    }

  }

  // utilities to make transactions //
  const getProvider = () => {
    if (wallet)
      return new anchor.Provider(connection, wallet as anchor.Wallet, COMMITMENT as anchor.web3.ConfirmOptions);
  }

  const makeStakeTx = async (program: anchor.Program<any>, poolSigner: PublicKey, pool: PublicKey, nft: any) => {
    let transaction: any = [];
    let signers: any[] = [];
    if (!wallet)
      return;
    let [poolData, _nonceData] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_DATA_SEEDS)],
      program.programId
    );

    let newTx: any = await makeNftAta(poolSigner, nft);
    let nftATA = new PublicKey(newTx.nftATA);
    if (newTx.transaction.length !== 0) {
      transaction = [...transaction, ...newTx.transaction];
      signers = [...signers, ...newTx.signers]
    }
    transaction.push(program.instruction.stake(nft.token_type, nft.attribute, {
      accounts: {
        user: wallet.publicKey,
        mint: nft.mint,
        pool: pool,
        data: poolData,
        from: nft.tokenAccount,
        tokenFrom: new PublicKey(nft.rewardATA),
        tokenTo: new PublicKey(REWARD_TOKEN_ACCOUNT),
        to: new PublicKey(newTx.nftATA),
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      },
      signers
    }));
    return { transaction, signers, nftATA };
  }

  const makeUnstakeTx = async (nft: NFTInfo) => {
    const provider = getProvider();
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    let [poolSigner, _nonceSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SIGNER_SEEDS), wallet!.publicKey.toBuffer()],
      program.programId
    );

    let [vault, _nonceVault] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(VAULT_PDA_SEEDS)],
      program.programId
    );

    let [poolData, _nonceData] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_DATA_SEEDS)],
      program.programId
    );
    let [pool, _noncePool] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEEDS), wallet!.publicKey!.toBuffer(), new PublicKey(nft.mint).toBuffer()],
      program.programId
    );

    let transaction: any = [];
    let signers: any = [];

    let newUnstakeTx = await makeNftAta(wallet!.publicKey, nft);
    if (newUnstakeTx?.transaction.length !== 0) {
      transaction = [...newUnstakeTx?.transaction];
      signers = [...newUnstakeTx?.signers];
    }
    nft.tokenTo = newUnstakeTx?.nftATA;
    let nftTo: any = newUnstakeTx?.nftATA;
    transaction.push(
      program.instruction.unstake(_nonceSigner, _nonceVault, {
        accounts: {
          pool: pool,
          poolSigner: poolSigner,
          user: wallet!.publicKey!,
          mint: new PublicKey(nft.mint),
          vault: vault,
          data: poolData,
          nftFrom: new PublicKey(nft.tokenAccount),
          nftTo: new PublicKey(nft.tokenTo),
          tokenFrom: new PublicKey(REWARD_TOKEN_ACCOUNT),
          tokenTo: new PublicKey(nft.rewardATA),
          tokenProgram: TOKEN_PROGRAM_ID
        }
      }));
    return { transaction, signers, nftTo }
  }

  const makeClaimTx = async (nft: NFTInfo) => {
    const provider = getProvider();
    const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
    let [vault, _nonceVault] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(VAULT_PDA_SEEDS)],
      program.programId
    );
    let [pool, _noncePool] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEEDS), wallet!.publicKey!.toBuffer(), nft.mint.toBuffer()],
      program.programId
    );
    let transaction = [];
    let tokenResult = await getTokenAccountByOwner(wallet!.publicKey!.toString(), nft.mint.toString());
    transaction.push(
      program.instruction.claim(_nonceVault, {
        accounts: {
          pool: pool,
          user: wallet!.publicKey!,
          mint: nft.mint,
          vault: vault,
          tokenFrom: new PublicKey(REWARD_TOKEN_ACCOUNT),
          tokenTo: new PublicKey(nft.rewardATA),
          tokenProgram: TOKEN_PROGRAM_ID
        }
      }));

    return transaction;
  }
  // functions to get associated token accounts //
  const makeRewardAta = async () => {

    let transaction: any = [];
    let signers: any = [];
    let rewardATA = '';
    let tokenResult = await getTokenAccountByOwner(wallet!.publicKey.toString(), REWARD_TOKEN_MINT);
    let result = tokenResult.result.value;
    if (result.err) {
      addToast('Unstaking failed!', {
        appearance: 'error',
        autoDismiss: true,
      })
      setLoading(false);
      return;
    }
    if (result.length === 0) {
      const aTokenAccount = new Keypair();
      const aTokenAccountRent = await connection.getMinimumBalanceForRentExemption(
        AccountLayout.span
      )
      transaction.push(SystemProgram.createAccount({
        fromPubkey: wallet!.publicKey,
        newAccountPubkey: aTokenAccount.publicKey,
        lamports: aTokenAccountRent,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
      }));
      transaction.push(
        Token.createInitAccountInstruction(
          TOKEN_PROGRAM_ID,
          new PublicKey(REWARD_TOKEN_MINT),
          aTokenAccount.publicKey,
          wallet!.publicKey
        ));
      signers.push(aTokenAccount);
      rewardATA = aTokenAccount.publicKey.toString();
    } else {
      rewardATA = result[0].pubkey.toString();
    }
    return { rewardATA, transaction, signers }
  }

  const makeNftAta = async (poolSigner: PublicKey, nft: any) => {
    let transaction: any = [];
    let signers: any = [];
    let nftATA: any = '';

    let tokenResult = await getTokenAccountByOwner(poolSigner.toString(), nft.mint.toString());
    let result = tokenResult.result?.value;
    if (result.err) {
      addToast('Staking failed!', {
        appearance: 'error',
        autoDismiss: true,
      })
      console.log("error in makeNftAta ", result.err);
      setLoading(false);
      return;
    }

    if (result.length === 0) {
      const aTokenAccount = new Keypair();
      const aTokenAccountRent = await connection.getMinimumBalanceForRentExemption(AccountLayout.span)
      transaction.push(SystemProgram.createAccount({
        fromPubkey: wallet!.publicKey,
        newAccountPubkey: aTokenAccount.publicKey,
        lamports: aTokenAccountRent,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
      }));
      transaction.push(Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        nft.mint,
        aTokenAccount.publicKey,
        poolSigner
      ));

      signers.push(aTokenAccount);
      nftATA = aTokenAccount.publicKey.toString();
    } else {
      nftATA = result[0].pubkey.toString();
    }
    return {
      nftATA, transaction, signers
    }
  }
  return (
    <div className="div">
      <img className="wrapper-image" src={getImg('background.jpg')} alt="Background" />
      {
        loading ?
          <div id="preloader">
            {<div style={{ paddingTop: '150px', fontSize: '50px' }}>{loadingText}</div>}
          </div> :
          <div id="preloader" style={{ display: 'none' }}></div>
      }
      <Header wallet={wallet} walletBalance={walletBalance} />
      <div className="home row w-100 new-home">

        <div className="home row w-100 new-home">
          <div className='align-items-center' style={{ display: ' flex', margin: '40px auto 0 auto', width: '92%', }}>
            <div className='col-3 text-end' style={{ fontSize: '35px', color: '#00FBA9', width: '25%' }}></div>

            <div className='col-6 text-center d-flex justify-content-center' style={{ fontSize: '35px', color: '#00FBA9', width: '50%', flexWrap: `wrap` }}>
              <p className='font-source' style={{ width: `100%`, marginBottom: `42px` }}>
                PUNKY APES CLUB
              </p>

              <div className="justify-content-center align-items-center text-custom-rt"
              >
                <p>3333 PUNKY APES ARE ON A MISSION TO ESTABLISH</p>
                <p>
                  THE METAVERSE'S NEXT-GENERATION FINEST CLUB.
                </p>
                <p>
                  THIS ISN'T YOUR ORDINARY PFP.
                </p>

              </div>
            </div>

            <div className='col-3' style={{ display: 'flex', width: `25%` }}>
              <div className='' style={{ marginLeft: 'auto' }}>
                <div className="btn_group">
                  <div className="balance-btn_other d_flex justify_content_center">
                    <div className="d_flex content_center align_items_center">
                      <div className="font_custom">
                        <p className="m-auto">Balance: {" "}{walletBalance.toFixed(2)}</p>
                        <p>$PAC</p>
                      </div>
                    </div>
                  </div>
                </div>
                <WalletMultiButton className='wallet-btn  mt_10' />
              </div>
            </div>
          </div>
        </div>

        <div className='mt_50 d_flex justify_content_center'>
          <CircularProgressbarWithChildren value={totalStakedNft / TOTAL_NFT_SUPPLY}>
            <div style={{ fontSize: 30, marginTop: -5, color: '#00FBA9' }}>
              <strong>{totalStakedNft}/{TOTAL_NFT_SUPPLY}</strong> staked
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <div className="nft-container">
          <div className="nft-collection">
            <div className="eggs egg-div">
              {walletNfts?.length > 2 &&
                walletNfts.map((nft, index) => {
                  return (
                    <WalletBox
                      img={nft?.imageUrl}
                      key={index}
                      name={nft?.name}
                      type={0}
                      splTokenPerDay={SPL_TOKEN_PER_DAY}
                      onClicks={[async () => await onStake(nft)]} id={index}
                      values={["stake"]}
                      loop={false}
                      canClaim={nft?.canClaim}
                      dayPassed={nft?.daysPassed}
                    />
                  )
                })
              }
              {walletNfts?.length < 3 && <>
                {walletNfts.map((nft, index) => {
                  return (nft?.name ? <WalletBox
                    img={nft?.imageUrl}
                    key={index}
                    name={nft?.name}
                    type={0}
                    onClicks={[async () => await onStake(nft)]} id={index}
                    splTokenPerDay={SPL_TOKEN_PER_DAY}
                    values={["stake"]}
                    loop={true}
                    canClaim={nft.canClaim}
                    dayPassed={nft.daysPassed}
                  /> : '')
                })}
              </>}
            </div>
          </div>
          <div className="nft-collection" style={{ marginTop: '0px', paddingBottom: '150px' }}>
            <div className="nft-title text_center title-text font-source font-700" style={{
              fontSize: '35px',
              color: '#00FBA9', paddingTop: `150px`
            }}>STAKED PUNKY APES </div>
            <div className="eggs egg-div" style={{ paddingTop: '74px' }}>
              {stakedNfts?.length > 2 &&

                stakedNfts?.length && stakedNfts.map((nft, index) => {
                  return (
                    // <SwiperSlide 
                    <StakedBox
                      img={nft.imageUrl}
                      key={index}
                      name={nft.name}
                      type={0}
                      splTokenPerDay={SPL_TOKEN_PER_DAY}
                      current={nft?.current}
                      onClicks={[async () => await onClaim(nft), async () => await onUnstake(nft)]}
                      values={["Claim", "Unstake"]}
                      loop={false}
                      canClaim={nft.canClaim}
                      dayPassed={nft.daysPassed}
                    />
                  )
                })
              }
              {stakedNfts?.length < 3 && <>
                {stakedNfts.map((nft, index) => {
                  return (nft.name ? <StakedBox
                    img={nft.imageUrl}
                    key={index}
                    name={nft.name}
                    type={0}
                    width={"50%"}
                    values={["Claim", "Unstake"]}
                    splTokenPerDay={SPL_TOKEN_PER_DAY}
                    current={nft?.current}
                    onClicks={[async () => await onClaim(nft), async () => await onUnstake(nft)]}
                    loop={true}
                    canClaim={nft.canClaim}
                    dayPassed={nft.daysPassed}
                  /> : '')
                })}
              </>}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
export default HomePage;