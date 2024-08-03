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

const NFTMINT_CONTRACT_ADDRESS = '0x721761446D1595346475A9F0d7dc13a1B93Ffcc3';
const MINT_PRICE = 0.00333173; // in ETH (Base chain native currency)
const BASE_CHAIN_ID = '0x2105'; // Hexadecimal representation of 8453

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
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [mintAmount, setMintQuantity] = useState<number>(1);

  useEffect(() => {
    if (walletProvider) {
      setIsConnected(true);
      const getAccount = async () => {
        const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        console.log('Account connected:', accounts[0]);
      };
      getAccount();
      switchToBase();
    } else {
      setIsConnected(false);
    }
  }, [walletProvider]);

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContractData = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const supply = await contract.totalSupply();
      setTotalSupply(Number(supply));
    } catch (error) {
      toast({
        title: 'Error Fetching Data',
        description: 'There was an issue fetching data from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching contract data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToBase = async () => {
    if (walletProvider?.request) {
      try {
        console.log('Switching to Base chain...');
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_CHAIN_ID }],
        });
        console.log('Switched to Base chain');
      } catch (switchError) {
        if ((switchError as { code: number }).code === 4902) {
          console.log('Base chain not found. Adding network...');
          try {
            await walletProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: BASE_CHAIN_ID,
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'Base',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
            console.log('Added and switched to Base chain');
          } catch (addError) {
            console.error('Error adding Base chain:', addError);
          }
        } else {
          console.error('Error switching to Base chain:', switchError);
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
      await switchToBase();
      onOpen();
      setModalContent({ status: 'Awaiting transaction confirmation...', tokenId: null, txHash: null });

      if (!walletProvider) {
        throw new Error('Wallet provider is not available');
      }

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      console.log('Signer:', signer);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, signer);
      console.log('Contract:', contract);

      const value = parseEther((MINT_PRICE * mintAmount).toString());
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

      setModalContent({
        status: `You Just Minted a Pirate Pigz NFT! #${tokenIdInt}`,
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

      fetchContractData();
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

  const handleIncrement = () => {
    setMintQuantity((prev) => Math.min(prev + 1, 25));
  };

  const handleDecrement = () => {
    setMintQuantity((prev) => Math.max(prev - 1, 1));
  };

  const maxSupply = 300;
  const remainingSupply = maxSupply - totalSupply;

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
          <Image src="/images/minimntpirate.png" alt="" boxSize="120px" borderRadius="xl" mr="5" />
          <Box textAlign="left">
            <Text fontSize="md" fontWeight="semibold" textAlign="left">
              Mint another Base Pigz Right Now!
            </Text>
            <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
              Mint 1 now for 0.00333173 ETH (Base)
            </Text>
          </Box>
        </Flex>

        <Box marginBottom="1" display="flex" alignItems="center" justifyContent="center">
          <Button
            onClick={onMintClick}
            disabled={!isConnected || isLoading || remainingSupply === 0}
            textColor="white"
            bg="#152dff"
            _hover={{ bg: '#136bff' }}
          >
            Mint another Base Pigz NFT!
          </Button>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color="white" bg="rgba(0, 0, 0, 0.65)">
          <ModalHeader>{modalContent.status}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalContent.tokenId && (
              <>
                <Text mt="4">You Just Minted a Base Pigz NFT!</Text>
                <a href={`https://basescan.org/tx/${modalContent.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                  View on BaseScan
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
