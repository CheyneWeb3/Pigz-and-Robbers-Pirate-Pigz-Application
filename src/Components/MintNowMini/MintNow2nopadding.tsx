import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  keyframes,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import {
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
import { ethers, parseEther, BrowserProvider } from 'ethers';
import nftMintAbi from './nftMintAbi.json';

const glow = keyframes`
  10% { border-color: white; box-shadow: 0 0 5px white; }
  50% { border-color: white; box-shadow: 0 0 20px white; }
  100% { border-color: white; box-shadow: 0 0 50px white; }
`;

const NFTMINT_CONTRACT_ADDRESS = '0xAC40d2487295C6AcdCAbe317B3042b1A15380a0C'; // Contract address for BSC Testnet

const MintNow2nopadding = () => {
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { walletProvider } = useWeb3ModalProvider();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState<{ status: string; tokenId: number | null; txHash: string | null }>({
    status: 'Awaiting transaction confirmation...',
    tokenId: null,
    txHash: null,
  });
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (walletProvider) {
      setIsConnected(true);
      const getAccount = async () => {
        const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        console.log('Account connected:', accounts[0]);
      };
      getAccount();
    } else {
      setIsConnected(false);
    }
  }, [walletProvider]);

  const switchToBSC = async () => {
    if (walletProvider?.request) {
      try {
        console.log('Switching to BSC Testnet...');
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // Chain ID for BSC Testnet
        });
        console.log('Switched to BSC Testnet');
      } catch (switchError) {
        if ((switchError as { code: number }).code === 4902) {
          console.log('BSC Testnet not found. Adding network...');
          try {
            await walletProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61',
                  chainName: 'Binance Smart Chain Testnet',
                  nativeCurrency: {
                    name: 'tBNB',
                    symbol: 'tBNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://data-seed-prebsc-1-s3.binance.org:8545'],
                  blockExplorerUrls: ['https://testnet.bscscan.com'],
                },
              ],
            });
            console.log('Added and switched to BSC Testnet');
          } catch (addError) {
            console.error('Error adding BSC Testnet:', addError);
          }
        } else {
          console.error('Error switching to BSC Testnet:', switchError);
        }
      }
    }
  };

  const onMintClick = async () => {
    if (!isConnected) {
      open();
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint an NFT.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await switchToBSC();
      onOpen();
      setModalContent({ status: 'Awaiting transaction confirmation...', tokenId: null, txHash: null });

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      console.log('Signer:', signer);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, signer);
      console.log('Contract:', contract);

      const mintAmount = 1;
      const value = parseEther('0.09');
      console.log(`Minting ${mintAmount} NFTs with value ${value.toString()}`);

      const transaction = await contract.mint(account, mintAmount, { value });
      console.log('Transaction:', transaction);

      setTransactionHash(transaction.hash);
      setIsLoading(true);

      const receipt = await transaction.wait();
      console.log('Transaction receipt:', receipt);
      setIsLoading(false);

      setModalContent({ status: 'Transaction confirmed. Processing mint...', tokenId: null, txHash: transaction.hash });

      const tokenId = receipt.logs[0].topics[3];
      const tokenIdInt = parseInt(tokenId, 16);
      console.log('Token ID:', tokenIdInt);
      const metadataUrl = `https://pigzandrobbers.meta.rareboard.com/api/${tokenIdInt}.json`;
      const metadataResponse = await fetch(metadataUrl);
      const metadata = await metadataResponse.json();
      const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log('Image URL:', imageUrl);

      setModalContent({
        status: `You Just Minted a Pigz and Robbers NFT! #${tokenIdInt}`,
        tokenId: tokenIdInt,
        txHash: transaction.hash,
      });

      toast({
        title: 'NFT Minted',
        description: 'Your NFT has been successfully minted!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Error',
        description: 'An error occurred during the minting process.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setModalContent({ status: 'Minting error. Please try again.', tokenId: null, txHash: null });
    }
  };

  return (
    <>
      <Box
        p={15}
        bg="rgba(0, 0, 0, 0.65)"
        borderRadius="2xl"
        boxShadow="xl"
        border="5px"
        borderColor="purple"
        animation={`${glow} 2s infinite`}
        h="200px"
        marginTop="25px"
        width="100%"
        textAlign="center"
        maxWidth="600px"
      >
        <Flex color="white" alignItems="center" mb="1">
          <Image src="/images/minimnt.png" alt="" boxSize="120px" borderRadius="xl" mr="5" />
          <Box textAlign="left">
            <Text fontSize="md" fontWeight="semibold" textAlign="left">
              Mint another Here Real Fast!
            </Text>
            <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
              Mint 1 now for 0.09 BNB
            </Text>
            <a
              href="https://element.market/collections/aplhadawgz-NFT"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '25px',
                color: 'white',
              }}
            >
              View on Element Market
            </a>
          </Box>
        </Flex>
        <Button
          mt="2"
          ml="2"
          width="70%"
          bg="#d19a19"
          textColor="white"
          _hover={{ bg: '#be439e' }}
          onClick={onMintClick}
        >
          Mint another PIGZandROBBERS!
        </Button>
        <Box mt="1" textAlign="center"></Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
      color="white"

        bg="rgba(0, 0, 0, 0.65)"
        >
          <ModalHeader>{modalContent.status}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalContent.tokenId && (
              <>
                <Text mt="4">You Just Minted a Pigz and Robbers NFT! #{modalContent.tokenId}</Text>
                <a href={`https://testnet.bscscan.com/tx/${modalContent.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                  View on BscScan
                </a>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Back to Page
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MintNow2nopadding;
