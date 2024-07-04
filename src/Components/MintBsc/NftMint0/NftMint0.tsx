import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Image,
  Text,
  Link,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import ClaimToast from '../Claim/ClaimToast';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';

import './mintNftStyles.css';
import nftMintAbi from './nftMintAbi.json';

const MINT_PRICE = 0.04;
const MINT_SUPPLY = 150;

const NFTMINT_CONTRACT_ADDRESS = '0x466cc282a58333F3CD94690a520b5aFAD30506cD'; // Testnet contract address
const RPC_PROVIDER = 'https://data-seed-prebsc-1-s3.binance.org:8545'; // Testnet RPC
const EXPLORER_LINK = 'https://testnet.bscscan.com'; // Testnet explorer

const getExplorerLink = (tokenId: number) => `${EXPLORER_LINK}/token/${NFTMINT_CONTRACT_ADDRESS}?a=${tokenId}`;
const getMarketplaceLink = (tokenId: number) => `https://element.market/assets/bsc/${NFTMINT_CONTRACT_ADDRESS}/${tokenId}`;

interface ContractError extends Error {
  data?: {
    message: string;
  };
}

function NftMint() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [selectedNft, setSelectedNft] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [mintAmount, setMintQuantity] = useState<number>(1);
  const [mintLoading, setMintLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContractData = async () => {
    if (!window.ethereum) {
      toast({
        title: 'Error',
        description: 'Ethereum object not found, make sure you have MetaMask!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
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
      setLoading(false);
    }
  };

  const onMintClick = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      open();
      return;
    }

    setMintLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, signer);
      const tx = await contract.mint(mintAmount, {
        value: ethers.parseEther((MINT_PRICE * mintAmount).toString()),
      });
      await tx.wait();
      fetchContractData();
    } catch (error) {
      console.error('Minting error:', error);
      const contractError = error as ContractError;
      const errorMessage = contractError.data ? contractError.data.message : 'An unknown error occurred.';
      toast({
        title: 'Minting Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMintLoading(false);
    }
  };

  const handleIncrement = () => {
    setMintQuantity((prev) => Math.min(prev + 1, 5));
  };

  const handleDecrement = () => {
    setMintQuantity((prev) => Math.max(prev - 1, 1));
  };

  const maxSupply = MINT_SUPPLY;
  const remainingSupply = maxSupply - totalSupply;

  const addNftToWallet = async (tokenId: number) => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('Ethereum object not found');
      }

      const metadataResponse = await fetch(`${METADATA_BASE_URL}${tokenId}.json`);
      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const metadata = await metadataResponse.json();
      const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: NFTMINT_CONTRACT_ADDRESS,
            tokenId: tokenId.toString(),
            symbol: 'PIGZ',
            image: imageUrl,
          },
        },
      });

      if (wasAdded) {
        notify.success('NFT added to wallet!');
      } else {
        notify.error('NFT addition rejected');
      }
    } catch (error) {
      console.error('Error adding NFT to wallet', error);
      notify.error('Error adding NFT to wallet');
    }
  };

  const [nfts, setNfts] = useState<number[]>([]);

  const fetchNFTs = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const balance = await contract.balanceOf(address);
      const nftList: number[] = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        nftList.push(Number(tokenId));
      }
      setNfts(nftList);
    } catch (error) {
      toast({
        title: 'Error Fetching NFTs',
        description: 'There was an issue fetching NFTs from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

  const handleViewNft = (tokenId: number) => {
    setSelectedNft(tokenId);
    onOpen();
  };

  return (
    <>
      <header>
        <div className="header-logo">
          <Link href="/" isExternal>
            <Image src="/images/logotoast.png" alt="Toast Logo" width="150px" />
          </Link>
        </div>
        <div className="connect-button">
          <w3m-button />
        </div>
      </header>
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 1)"
        bgImage="url('/images/bg2.png')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Box
          flex={1}
          p={0}
          m={0}
          display="flex"
          flexDirection="column"
          bg="rgba(0, 0, 0, 0.2)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >
          <Box
            bg="rgba(0,0,0,0)"
            padding="5px"
            width="100%"
            mx="auto"
            marginTop="0px"
          ></Box>

          <Box display="flex" justifyContent="center">
            <ClaimToast />
          </Box>

          <Box
            marginBottom="40px"
            bg="rgba(0,0,0,0.6)"
            borderRadius="2xl"
            padding="20px"
            mx="auto"
            my="10px"
            boxShadow="xl"
            maxWidth="800px"
            width="100%"
            textAlign="center"
            border="1px"
            borderColor="#a7801a"
          >
            <div>
              <Text className="pricecosthead" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
                Toast Champions NFT Collection
              </Text>
              <Text className="totalSupply" style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {loading ? 'Loading...' : `Sold : ${totalSupply} / ${maxSupply}`}
              </Text>
              <Text className="remainingSupply" style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {loading ? 'Loading...' : `Remaining Supply: ${remainingSupply}`}
              </Text>
              <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{ color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
                {NFTMINT_CONTRACT_ADDRESS}
              </Link>
              <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{ color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
                View on Explorer
              </Link>
            </div>
            {remainingSupply > 0 ? (
              <>
                <Text className="pricecost" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
                  Mint at {MINT_PRICE} BNB Each
                </Text>
                <Box marginTop="4" display="flex" alignItems="center" justifyContent="center">
                  <Button
                    onClick={handleDecrement}
                    disabled={mintAmount <= 1 || mintLoading || remainingSupply === 0}
                    textColor="white"
                    bg="#e8bf72"
                    _hover={{ bg: '#a7801a' }}
                  >
                    -
                  </Button>
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }} mx="4">
                    {mintAmount}
                  </Text>
                  <Button
                    onClick={handleIncrement}
                    disabled={mintAmount >= 5 || mintLoading}
                    textColor="white"
                    bg="#e8bf72"
                    _hover={{ bg: '#a7801a' }}
                  >
                    +
                  </Button>
                </Box>
                <Box marginTop="4" marginBottom="10" display="flex" alignItems="center" justifyContent="center">
                  <Button
                    onClick={onMintClick}
                    disabled={!isConnected || mintLoading || remainingSupply === 0}
                    textColor="white"
                    bg="#e8bf72"
                    _hover={{ bg: '#a7801a' }}
                    marginTop="4"
                  >
                    Mint Now
                  </Button>
                </Box>
              </>
            ) : (
              <Text className="pricecost" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }}>
                Minting has Completed!
              </Text>
            )}
            {mintError && <Text color="red.500" mt="4">Error: {mintError.message}</Text>}
          </Box>

          <Box
            marginTop="60px"
            bg="rgba(0,0,0,0.6)"
            borderRadius="2xl"
            padding="20px"
            mx="auto"
            my="10px"
            boxShadow="xl"
            maxWidth="800px"
            width="100%"
            textAlign="center"
            border="1px"
            borderColor="#a7801a"
          >
            <Text
              className="pricecosthead"
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bolder',
              }}
            >
              My Toasties
            </Text>
            {loading ? (
              <Text
                className="totalSupply"
                style={{
                  marginBottom: '40px',
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Please be patient while Loading...
              </Text>
            ) : nfts.length === 0 ? (
              <Text
                className="totalSupply"
                style={{
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                No Toasties found.
              </Text>
            ) : (
              <Wrap justify="center" spacing="10px">
                {nfts.map((tokenId) => (
                  <WrapItem key={tokenId}>
                    <Box
                      bg="rgba(0, 0, 0, 1)"
                      p="4"
                      borderRadius="2xl"
                      position="relative"
                      overflow="hidden"
                      border="1px"
                      borderColor="#a7801a"
                      _hover={{
                        '.overlay': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Image
                        src={`/images/nfts/${tokenId}.png`}
                        alt={`NFT ${tokenId}`}
                        width="80%"
                        height="80%"
                        borderRadius="2xl"
                        objectFit="cover"
                        mx="auto"
                        my="auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/250';
                        }}
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          onOpen();
                        }}
                      />
                      <Box
                        className="overlay"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        bg="rgba(0, 0, 0, 0.7)"
                        opacity="0"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        transition="opacity 0.3s ease-in-out"
                      >
                        <Text mt="2" color="white" textAlign="center">
                          Toasties TokenId {tokenId}
                        </Text>
                        <Link href={getMarketplaceLink(tokenId)} isExternal>
                          <Button
                            mt="2"
                            width="150px"
                            bg="#e8bf72"
                            textColor="white"
                            _hover={{ bg: '#a7801a' }}
                          >
                            Marketplace
                          </Button>
                        </Link>
                        <Button
                          mt="2"
                          width="150px"
                          bg="#e8bf72"
                          textColor="white"
                          _hover={{ bg: '#a7801a' }}
                          onClick={() => addNftToWallet(tokenId)}
                        >
                          Add to Wallet
                        </Button>
                        <Button
                          mt="2"
                          width="150px"
                          bg="#e8bf72"
                          textColor="white"
                          _hover={{ bg: '#a7801a' }}
                          onClick={() => handleViewNft(tokenId)}
                        >
                          View Fullscreen
                        </Button>
                        <Link
                          style={{
                            marginTop: '40px',
                            color: 'white',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                          href={getExplorerLink(tokenId)}
                          isExternal
                          mt="2"
                          color="white"
                          textAlign="center"
                        >
                          View on BSCScan
                        </Link>
                      </Box>
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </Box>
          <Box
            bg="rgba(0,0,0,0)"
            padding="20px"
            width="100%"
            mx="auto"
            marginTop="30px"
          >
            <Image
              marginBottom="40px"
              src="/images/toastmanImage.png"
              mx="auto"
              alt="Toast Man"
              width="220px"
            />
          </Box>

          <Footer />
        </Box>
      </Box>

      {selectedNft !== null && (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent bg="black">
            <ModalCloseButton color="white" />
            <ModalBody display="flex" alignItems="center" justifyContent="center">
              <Center>
                <Image
                  src={`/images/nfts/${selectedNft}.png`}
                  alt={`NFT ${selectedNft}`}
                  maxHeight="90vh"
                  maxWidth="90vw"
                  objectFit="contain"
                />
              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <ToastContainer />
    </>
  );
}

export default NftMint;
