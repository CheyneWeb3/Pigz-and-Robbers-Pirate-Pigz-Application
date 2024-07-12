import React, { useState, useEffect } from 'react';
import { Box, Flex, Image, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
import ClaimInfo from './ClaimInfo';

const ClaimPage = () => {
  const { open } = useWeb3Modal();
  const { account, isConnected } = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();

  useEffect(() => {
    if (!isConnected) {
      open();
    }
  }, [isConnected, open]);

  const connectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" color="white" mt={10}>
        <Button colorScheme="teal" onClick={connectWallet}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

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
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
              textAlign="center"
            >
              <Text fontSize="4xl" mb={4}>Claim Your Rewards</Text>
              <ClaimInfo userAddress={account.address} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ClaimPage;
