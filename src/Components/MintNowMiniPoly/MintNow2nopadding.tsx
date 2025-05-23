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

const NFTMINT_CONTRACT_ADDRESS = '0x8Fc39D096204Ddc68f67aAfF0B63fE2207cB7738';
const MINT_PRICE = 6;

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
      switchToPolygon();
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
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
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

  const switchToPolygon = async () => {
    if (walletProvider?.request) {
      try {
        console.log('Switching to Polygon Mainnet...');
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        });
        console.log('Switched to Polygon Mainnet');
      } catch (switchError) {
        if ((switchError as { code: number }).code === 4902) {
          console.log('Polygon Mainnet not found. Adding network...');
          try {
            await walletProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x89',
                  chainName: 'Polygon Mainnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  rpcUrls: ['https://polygon-rpc.com/'],
                  blockExplorerUrls: ['https://polygonscan.com'],
                },
              ],
            });
            console.log('Added and switched to Polygon Mainnet');
          } catch (addError) {
            console.error('Error adding Polygon Mainnet:', addError);
          }
        } else {
          console.error('Error switching to Polygon Mainnet:', switchError);
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
      await switchToPolygon();
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
              Mint another Pirate Pigz Right Now!
            </Text>
            <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
              Mint 1 now for 6 MATIC
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

        <Box marginBottom="1" display="flex" alignItems="center" justifyContent="center">
          <Button
            onClick={onMintClick}
            disabled={!isConnected || isLoading || remainingSupply === 0}
            textColor="white"
            bg="#7140d7"
            _hover={{ bg: '#824fff' }}
          >
            Mint another Pirate Pigz NFT!
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
                <Text mt="4">You Just Minted a Pigz and Robbers NFT!</Text>
                <a href={`https://polygonscan.com/tx/${modalContent.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                  View on Polygonscan
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
