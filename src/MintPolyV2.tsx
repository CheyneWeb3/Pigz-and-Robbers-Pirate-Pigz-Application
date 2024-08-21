import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button, Link as ChakraLink } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import { Link as RouterLink } from 'react-router-dom'; // Import Link from react-router-dom
import Footer from './Components/Footer/Footer';

import ViewPoly from './Components/MintPolyV2/ViewCollectionPOLY';
import ClaimPirateV2 from './Components/MintPolyV2/ClaimRewardsComponent/ClaimRewards';
import MintPoly from './Components/MintPolyV2/NftMint0/NftMint0';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';

const imagePaths = [
  '/images/v2pirates/256.png',
  '/images/v2pirates/257.png',
  '/images/v2pirates/258.png',
  '/images/v2pirates/259.png',
  '/images/v2pirates/260.png',
  '/images/v2pirates/261.png',
  '/images/v2pirates/262.png',
  '/images/v2pirates/263.png',
  '/images/v2pirates/264.png',
  '/images/v2pirates/265.png',
  '/images/v2pirates/266.png',
  '/images/v2pirates/267.png',
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
            <RouterLink to="/">
              <Image p={2} ml="4" src="/images/mainlogovert.png" alt="Heading" width="80px" />
            </RouterLink>
            <Flex align="right">
              <w3m-button />
            </Flex>
          </Flex>

          <ClaimPirateV2 />
          <Flex
            flex={1}
            mt={2}
            p={4}
            borderRadius="2xl"
            textAlign="center"
            bg="rgba(0, 0, 0, 0.61)"
            alignItems="flex-start"
            justifyContent="center"
            h="auto" // Adjust height as necessary
          >
            <Box ml={4}>
              <Text textAlign="left" fontSize="xl" fontWeight="bolder">
                View User Stats and collection details here
              </Text>
              <Button
                as={RouterLink}
                to="/user"
                colorScheme="purple"
                size="md"
                mt={4}
                textAlign="left"
              >
                Go to User Page
              </Button>
            </Box>
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
                  border="2px"
                  borderColor="#7140d7"
              >
                <Image src="images/piratepigztextlogoV2.png" alt="header" mx="auto" width="40%" minW="250px" mb="28px" mt="28px" />
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
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                  border="2px"
                  borderColor="#7140d7"
              >
                <RouterLink to="/mintpoly">
                  <Flex justifyContent="center" flexWrap="wrap">
                    <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal"></Text>
                  </Flex>
                  <Image
                    src={currentImage} alt="Pirate Pigz" mx="auto" width="85%" minW="380px" mt="90px" borderRadius="2xl" />
                </RouterLink>
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
