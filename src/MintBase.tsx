import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import { Link } from 'react-router-dom';
import Footer from './Components/Footer/Footer';

import ViewBase from './Components/MintBase/ViewCollectionBase';

import MintBase from './Components/MintBase/NftMint0/NftMint0';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';

const imagePaths = [
  '/images/basepigz/1.png',
  '/images/basepigz/2.png',
  '/images/basepigz/3.png',
  '/images/basepigz/4.png',
  '/images/basepigz/5.png',
  '/images/basepigz/6.png',
];

const NewPage = () => {
  const [tokenData, setTokenData] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>(imagePaths[0]);
  const { walletProvider } = useWeb3ModalProvider();
  const { isConnected } = useWeb3ModalAccount();

  useEffect(() => {
    const switchToBaseMainnet = async () => {
      if (walletProvider?.request) {
        try {
          await walletProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Chain ID for Base Mainnet
          });
          console.log('Switched to Base Mainnet');
        } catch (switchError) {
          if ((switchError as { code: number }).code === 4902) {
            console.log('Base Mainnet not found. Adding network...');
            try {
              await walletProvider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x2105',
                    chainName: 'Base Mainnet',
                    nativeCurrency: {
                      name: 'BASE',
                      symbol: 'BASE',
                      decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                ],
              });
              console.log('Added and switched to Base Mainnet');
            } catch (addError) {
              console.error('Error adding Base Mainnet:', addError);
            }
          } else {
            console.error('Error switching to Base Mainnet:', switchError);
          }
        }
      }
    };

    if (isConnected) {
      switchToBaseMainnet();
    } else {
      // Listen for when the user connects the wallet and then switch
      (window as any).ethereum?.on('connect', switchToBaseMainnet);
    }

    return () => {
      (window as any).ethereum?.removeListener('connect', switchToBaseMainnet);
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
            <Link to="/">
              <Image p={2} ml="4" src="/images/mainlogovert.png" alt="Heading" width="80px" />
            </Link>
            <Flex align="right">
              <w3m-button />
            </Flex>
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
                  borderColor="#152dff"
              >
                <Image src="images/baseArmyTextLogo.png" alt="header" mx="auto" width="40%" minW="250px" mb="28px" mt="28px" />
                <MintBase />
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
                  borderColor="#152dff"
              >
                <Link to="/mintbase">
                  <Flex justifyContent="center" flexWrap="wrap">
                    <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal"></Text>
                  </Flex>
                  <Image
                    src={currentImage} alt="Pirate Pigz" mx="auto" width="85%" minW="380px" mt="90px" borderRadius="2xl" />
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
              <ViewBase />
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
