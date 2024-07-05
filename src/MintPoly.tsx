import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Footer from './Components/Footer/Footer';

import ViewPoly from './Components/MintPoly/ViewCollectionPOLY';

import MintPoly from './Components/MintPoly/NftMint0/NftMint0';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';

const imagePaths = [
  '/images/pirates/256.png',
  '/images/pirates/257.png',
  '/images/pirates/258.png',
  '/images/pirates/259.png',
  '/images/pirates/260.png',
  '/images/pirates/261.png',
  '/images/pirates/262.png',
  '/images/pirates/263.png',
  '/images/pirates/264.png',
  '/images/pirates/265.png',
  '/images/pirates/266.png',
  '/images/pirates/267.png',
];

const NewPage = () => {
  const [tokenData, setTokenData] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>(imagePaths[0]);
  const { walletProvider } = useWeb3ModalProvider();
  const { isConnected } = useWeb3ModalAccount();

  useEffect(() => {
    const switchToPolygonMainnet = async () => {
      if (walletProvider?.request) {
        try {
          await walletProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // Chain ID for Polygon Mainnet
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

    if (isConnected) {
      switchToPolygonMainnet();
    } else {
      // Listen for when the user connects the wallet and then switch
      (window as any).ethereum?.on('connect', switchToPolygonMainnet);
    }

    return () => {
      (window as any).ethereum?.removeListener('connect', switchToPolygonMainnet);
    };
  }, [isConnected, walletProvider]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch('https://api.geckoterminal.com/api/v2/networks/degenchain/pools/0x401cd27b11e64527cc09bcad1febcf8fcae8e945');
        const data = await response.json();
        console.log('API Response:', data);
        setTokenData(data.data.attributes);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchTokenData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImage(imagePaths[Math.floor(Math.random() * imagePaths.length)]);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const glow = keyframes`
    from {
      box-shadow: 0 0 10px white;
    }
    to {
      box-shadow: 0 0 20px white, 0 0 30px white, 0 0 40px white, 0 0 50px white;
    }
  `;

  const glowStyle = css`
    animation: ${glow} 1.5s ease-in-out infinite alternate;
  `;

  const formatPrice = (price: string) => parseFloat(price).toFixed(8);
  const usdPrice = (price: string) => {
    return parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const textShadowStyle = css`
    text-shadow: 1px 1px 2px pink, 0 0 1em pink, 0 0 0.2em pink;
  `;

  return (
    <>
      <Box
        position="relative"
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        color="white"
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            objectFit: 'cover',
            zIndex: -2
          }}
        >
          <source src="/images/pigzbkg.mp4" type="video/mp4" />
        </video>

        <Box
          flex={1}
          p={0}
          m={0}
          bg="rgba(0, 0, 0, 0.65)"
          display="flex"
          flexDirection="column"
          color="white"
        >

          <Flex p={2} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
            <Link to="/">
              <Image p={2} ml="4" src="/images/banner.png" alt="Heading" width="220px" />
            </Link>
            <w3m-button />
          </Flex>
          <Box
            flex={1}
            p={0}
            m={0}
            display="flex"
            flexDirection="column"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            color="white"
          >
            <Flex justifyContent="center" p={2} flexWrap="wrap" position="relative">
              <Box
                flex={1}
                minW="300px"
                m={2}
                p={7}
                borderRadius="2xl"
                boxShadow="md"
                textAlign="center"
                bg="rgba(0, 0, 0, 0.61)"
              >
                <Image src="images/piratepigztextlogo.png" alt="header" mx="auto" width="60%" minW="250px" mb="28px" mt="28px" />
                <MintPoly />
              </Box>

              <Box
                flex={1}
                minW="300px"
                m={2}
                p={7}
                borderRadius="2xl"
                boxShadow="md"
                textAlign="center"
                bg="rgba(0, 0, 0, 0.61)"
              >
                <Link to="/mintpoly">
                  <Flex justifyContent="center" flexWrap="wrap">
                    <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal"></Text>
                  </Flex>
                  <Image src={currentImage} alt="Pirate Pigz" mx="auto" width="75%" minW="250px" mt="90px" borderRadius="2xl" />
                </Link>
              </Box>
            </Flex>

            <Box
              flex={1}
              m={2}
              p={4}
              bg="rgba(0, 0, 0, 0.61)"
              borderRadius="md"
              boxShadow="md"
              textAlign="center"
            >
              <ViewPoly />
              <Text mb="200px" fontSize="xl"></Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default NewPage;
