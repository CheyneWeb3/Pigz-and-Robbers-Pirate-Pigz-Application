import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Text,
  Link,
  Image,
  useToast,
} from '@chakra-ui/react';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
import nftMintAbi from './nftMintAbi.json';

const NFTMINT_CONTRACT_ADDRESS = '0x8d3B760381c2CAfBFf2D973C8ca534e27bbf63Db';
const RPC_PROVIDER = 'https://bsc-dataseed.binance.org/';
const EXPLORER_LINK = 'https://bscscan.com';

const MINT_SUPPLY = 3333; // Maximum supply of NFTs

function NftMint() {
  const toast = useToast();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mintLoading, setMintLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 30000); // Refresh data every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchContractData = async () => {
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);

      // Fetch total supply
      const supply = await contract.totalSupply();
      setTotalSupply(Number(supply));

      // Fetch mint price
      const cost = await contract.cost();
      setMintPrice(Number(ethers.formatEther(cost))); // Convert from Wei to BNB
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
      if (!walletProvider) {
        throw new Error('Wallet provider is not available');
      }

      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, signer);

      const tx = await contract.mint(address, mintAmount, {
        value: ethers.parseEther((mintPrice! * mintAmount).toString()),
      });
      await tx.wait();
      fetchContractData();
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Error',
        description: 'An error occurred while minting.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMintLoading(false);
    }
  };

  const handleIncrement = () => setMintAmount((prev) => Math.min(prev + 1, 25));
  const handleDecrement = () => setMintAmount((prev) => Math.max(prev - 1, 1));

  const maxSupply = MINT_SUPPLY;
  const remainingSupply = maxSupply - totalSupply;

  return (
    <Box
      flex={1}
      p={0}
      m={0}
      display="flex"
      flexDirection="column"
      bg="rgba(0, 0, 0, 0)"
      bgImage="url('/images/bg2.png')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Box
        marginBottom="40px"
        bg="rgba(0,0,0,0.6)"
        borderRadius="2xl"
        padding="20px"
        mx="auto"
        my="10px"
        boxShadow="xl"
        maxWidth="800px"
        minWidth="380px"
        width="100%"
        textAlign="center"
        border="2px"
        borderColor="#d19a19"
      >
        <div>
          <Text fontSize="xl" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
            Pigz and Robbers a Binance Smart Chain Collection
          </Text>
          <Image src="/images/binance.png" alt="header" mx="auto" width="20%" minW="100px" mt="28px" />

          <Text style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : `Sold: ${totalSupply} / ${maxSupply}`}
          </Text>
          <Text style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : `Remaining Supply: ${remainingSupply}`}
          </Text>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
            {mintPrice !== null ? `Mint Price: ${mintPrice} BNB Each` : 'Loading Mint Price...'}
          </Text>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '10px' }}>
            Contract Address
          </Text>
          <Text fontSize="lg" style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {NFTMINT_CONTRACT_ADDRESS}
          </Text>
          <Link isExternal href={`${EXPLORER_LINK}/token/${NFTMINT_CONTRACT_ADDRESS}`} style={{ color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
            View on Explorer
          </Link>
        </div>

        {remainingSupply > 0 ? (
          <>
            <Box marginTop="4" display="flex" alignItems="center" justifyContent="center">
              <Button
                onClick={handleDecrement}
                disabled={mintAmount <= 1 || mintLoading}
                textColor="white"
                bg="#d19a19"
                _hover={{ bg: '#a7801a' }}
              >
                -
              </Button>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }} mx="4">
                {mintAmount}
              </Text>
              <Button
                onClick={handleIncrement}
                disabled={mintAmount >= 5 || mintLoading}
                textColor="white"
                bg="#d19a19"
                _hover={{ bg: '#a7801a' }}
              >
                +
              </Button>
            </Box>
            <Box marginTop="4" display="flex" alignItems="center" justifyContent="center">
              <Button
                onClick={onMintClick}
                disabled={!isConnected || mintLoading}
                textColor="white"
                bg="#d19a19"
                _hover={{ bg: '#a7801a' }}
              >
                Mint Now
              </Button>
            </Box>
          </>
        ) : (
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }}>
            Minting has Completed!
          </Text>
        )}
      </Box>
    </Box>
  );
}

export default NftMint;
