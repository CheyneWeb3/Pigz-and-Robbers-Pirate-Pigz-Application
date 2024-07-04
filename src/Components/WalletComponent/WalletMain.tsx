import React, { useEffect, useState } from 'react';



import Footer from '../Footer/Footer';




import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
  useParams,
  useNavigate,
} from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Link as ChakraLink,
  Flex,
  Container,
  Tabs,
  TabList,
  TabPanels,
  VStack,
  Spacer,
  Tab,
  TabPanel,
  Input,
  Button,
  Text,
  Image,
  Center,
  useToast,
  Collapse,
} from "@chakra-ui/react";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalState,
  useWeb3ModalTheme,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
import mainbackgroundImage from "./bkg.png";
import tokenGif from "./token.gif";
import a7Logo from "./headerlogo.png";
import dawgImage from "./token.gif";
import MainTextLogo from "./headerlogo.png";
import { ethers, BrowserProvider, formatEther, formatUnits, parseEther } from 'ethers';
import Wallet from './walletpage';
import tokenAbi from './tokenAbi.json';

const TOKEN_CONTRACT_ADDRESS = "0x88CE0d545cF2eE28d622535724B4A06E59a766F0";
const DEVELOPER_WALLET_ADDRESS = "0x57103b1909fB4D295241d1D5EFD553a7629736A9";
const TREASURY_WALLET_ADDRESS = "0x0bA23Af142055652Ba3EF1Bedbfe1f86D9bC60f7";
const ALPHA7_LP_TOKEN_ADDRESS = "0xa2136fEA6086f2254c9361C2c3E28c00F9e73366";

const HomePage: React.FC = () => {
  const [userAddress, setUserAddress] = useState('');
  const [alpha7TokenBalance, setAlpha7TokenBalance] = useState('0.0000');
  const [bnbBalance, setBnbBalance] = useState('0.0000');
  const [developerTokenBalance, setDeveloperTokenBalance] = useState('0.0000');
  const [treasuryTokenBalance, setTreasuryTokenBalance] = useState('0.0000');
  const [developerBNBBalance, setDeveloperBNBBalance] = useState('0.0000');
  const [treasuryBNBBalance, setTreasuryBNBBalance] = useState('0.0000');
  const [alpha7LPTokenSupply, setAlpha7LPTokenSupply] = useState('0.0000');
  const [tokenPriceUSD, setTokenPriceUSD] = useState('Loading...');
  const [connectedWalletLPTokenBalance, setConnectedWalletLPTokenBalance] = useState('0.0000');
  const [developerWalletLPTokenBalance, setDeveloperWalletLPTokenBalance] = useState('0.0000');
  const [nftTreasuryWalletLPTokenBalance, setNftTreasuryWalletLPTokenBalance] = useState('0.0000');
  const [bnbPriceInUSD, setBnbPriceInUSD] = useState('');
  const [totalLiquidityUSD, setTotalLiquidityUSD] = useState('Loading...');
  const [totalReserveInUSD, setTotalReserveInUSD] = useState('Loading...');
  const [marketCap, setMarketCap] = useState('Loading...');
  const [lpTokenValue, setLpTokenValue] = useState('Loading...');

  const { open, close } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const toast = useToast();

  useEffect(() => {
    if (isConnected && walletProvider) {
      const fetchWalletDetails = async () => {
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        const fetchBNBBalance = async (walletAddress: string) => {
          const balanceWei = await provider.getBalance(walletAddress);
          return parseFloat(formatEther(balanceWei)).toFixed(4);
        };

        setBnbBalance(await fetchBNBBalance(address));
        setDeveloperBNBBalance(await fetchBNBBalance(DEVELOPER_WALLET_ADDRESS));
        setTreasuryBNBBalance(await fetchBNBBalance(TREASURY_WALLET_ADDRESS));

        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, signer);
        const balance = await tokenContract.balanceOf(address);
        setAlpha7TokenBalance(parseFloat(formatUnits(balance, 9)).toFixed(0));

        const developerBalance = await tokenContract.balanceOf(DEVELOPER_WALLET_ADDRESS);
        const treasuryBalance = await tokenContract.balanceOf(TREASURY_WALLET_ADDRESS);
        setDeveloperTokenBalance(parseFloat(formatUnits(developerBalance, 9)).toFixed(0));
        setTreasuryTokenBalance(parseFloat(formatUnits(treasuryBalance, 9)).toFixed(0));

        const alpha7LPContract = new ethers.Contract(ALPHA7_LP_TOKEN_ADDRESS, tokenAbi, signer);
        const lpTokenSupply = await alpha7LPContract.totalSupply();
        const formattedLPSupply = parseFloat(formatUnits(lpTokenSupply, 18)).toFixed(6);
        setAlpha7LPTokenSupply(formattedLPSupply);
      };

      fetchWalletDetails();
    }
  }, [isConnected, walletProvider]);

  useEffect(() => {
    const fetchBnbPrice = async () => {
      const apiUrl = 'https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const bnbPrice = data.data.attributes.token_prices['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'];
        setBnbPriceInUSD(bnbPrice);
      } catch (error) {
        console.error('Failed to fetch BNB price:', error);
      }
    };

    fetchBnbPrice();
  }, []);

  useEffect(() => {
    const url = `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/0x88CE0d545cF2eE28d622535724B4A06E59a766F0`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const attributes = data?.data?.attributes;

        if (attributes) {
          const { fdv_usd, total_reserve_in_usd, price_usd } = attributes;

          setMarketCap(fdv_usd ? `$${parseFloat(fdv_usd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 'Market Cap not available');
          setTotalReserveInUSD(total_reserve_in_usd ? `${parseFloat(total_reserve_in_usd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 'Total Reserve not available');
          setTokenPriceUSD(price_usd ? `${price_usd}` : 'Price not available');
        } else {
          setMarketCap('Data not available');
          setTotalReserveInUSD('Data not available');
          setTokenPriceUSD('Price not available');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMarketCap('Error fetching data');
        setTotalReserveInUSD('Error fetching data');
        setTokenPriceUSD('Error fetching price');
      });
  }, []);

  useEffect(() => {
    if (totalReserveInUSD !== 'Loading...' && totalReserveInUSD !== 'Total Reserve not available' && totalReserveInUSD !== 'Error fetching data') {
      const reserveValue = Number(totalReserveInUSD.replace(/[^0-9.-]+/g, ""));
      const liquidityValue = reserveValue * 2;
      setTotalLiquidityUSD(`${liquidityValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
    }
  }, [totalReserveInUSD]);

  useEffect(() => {
    const url = `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/${TOKEN_CONTRACT_ADDRESS}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const attributes = data?.data?.attributes;

        if (attributes) {
          setMarketCap(attributes.fdv_usd ? `$${parseFloat(attributes.fdv_usd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 'Market Cap not available');
          setTotalReserveInUSD(attributes.total_reserve_in_usd ? `${parseFloat(attributes.total_reserve_in_usd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 'Total Reserve not available');
          setTokenPriceUSD(attributes.price_usd ? `${attributes.price_usd}` : 'Price not available');

          const reserveNumeric = parseFloat(attributes.total_reserve_in_usd);
          const supplyNumeric = parseFloat(alpha7LPTokenSupply);
          if (!isNaN(reserveNumeric) && !isNaN(supplyNumeric) && supplyNumeric > 0) {
            setLpTokenValue((reserveNumeric / supplyNumeric).toFixed(8));
          } else {
            setLpTokenValue('Calculation error');
          }
        } else {
          setMarketCap('Data not available');
          setTotalReserveInUSD('Data not available');
          setTokenPriceUSD('Price not available');
          setLpTokenValue('Data not available');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMarketCap('Error fetching data');
        setTotalReserveInUSD('Error fetching data');
        setTokenPriceUSD('Error fetching price');
        setLpTokenValue('Error fetching data');
      });
  }, [alpha7LPTokenSupply]);

  useEffect(() => {
    const fetchLPTokenBalances = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum as any);  // Use type assertion here
        const signer = await provider.getSigner();
        const alpha7LPContract = new ethers.Contract(ALPHA7_LP_TOKEN_ADDRESS, tokenAbi, signer);

        const connectedWalletAddress = await signer.getAddress();
        const connectedWalletLPBalance = await alpha7LPContract.balanceOf(connectedWalletAddress);
        setConnectedWalletLPTokenBalance(formatUnits(connectedWalletLPBalance, 18));

        const developerWalletLPBalance = await alpha7LPContract.balanceOf(DEVELOPER_WALLET_ADDRESS);
        setDeveloperWalletLPTokenBalance(formatUnits(developerWalletLPBalance, 18));

        const nftTreasuryWalletLPBalance = await alpha7LPContract.balanceOf(TREASURY_WALLET_ADDRESS);
        setNftTreasuryWalletLPTokenBalance(formatUnits(nftTreasuryWalletLPBalance, 18));
      }
    };

    fetchLPTokenBalances();
  }, []);


  const logoSize = '28.5px';

  return (
    <>
    <Box>
      <Flex justifyContent="right" flexWrap="wrap">
        <w3m-network-button />
        <w3m-button />
      </Flex>
      <Box
        position="relative"
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            objectFit: 'cover',
            zIndex: -1
          }}
        >
          <source src="/images/bkg2.mp4" type="video/mp4" />
        </video>
        <Box
          flex={1}
          p={0}
          m={0}
          display="flex"
          bg="rgba(0, 0, 0, 0)"
        />
        <Flex mx="auto" align="center">
          <Image
            src="/images/walletfriends.png"
            alt="Harolds Wallet"
            width="55%"
            minW="340px"
            mx="auto"
          />
        </Flex>

        <Box
          marginBottom="40px"
          borderRadius="2xl"
          mx="auto"
          my="10px"
          boxShadow="xl"
          maxWidth="900px"
          width="100%"
          textAlign="left"
        >
          <Wallet />
        </Box>
        <Center>

          <Image
            src="/images/cup.png"
            alt="Harolds Wallet"
            width="35%"
            minW="340px"
            mx="auto"
            mt="100px"
            mb="200px"
          />

        </Center>
      </Box>
    </Box>
    <Footer/>
    </>
  );
};

export default HomePage;
