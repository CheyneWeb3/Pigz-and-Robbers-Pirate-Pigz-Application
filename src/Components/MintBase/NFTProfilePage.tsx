import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import MiniMintBsc from '../MintNowMini/MintNow2nopadding';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';

interface NftAttribute {
  trait_type: string;
  value: string;
}

interface NftData {
  name: string;
  description: string;
  attributes: NftAttribute[];
}

const NFTProfilePagepolyV2 = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [nftData, setNftData] = useState<NftData | null>(null);
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response = await fetch(`https://raw.githubusercontent.com/ArielRin/Pigz-and-Robbers-Pirate-Pigz-Application/fixfoot/public/baseArmyNFTData/Metadata/${tokenId}.json`);
        const data: NftData = await response.json();
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      }
    };

    fetchNFTData();
  }, [tokenId, walletProvider]);

  if (!nftData) {
    return <Text>Loading...</Text>;
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
              <Image p={2} ml="4" src="/images/mainlogovert.png" alt="Heading" width="80px" />
            </Link>
            <Flex align="right">
              <w3m-button />
            </Flex>
          </Flex>
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

          </Flex>
          <Box
            flex={1}
            p={0}
            m={0}
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
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
              <Image
                borderRadius="2xl"
                mx="auto"
                src={`https://raw.githubusercontent.com/ArielRin/Pigz-and-Robbers-Pirate-Pigz-Application/fixfoot/public/baseArmyNFTData/Images/${tokenId}.png`}
                alt={nftData.name}
                width="75%"
              />
            </Box>
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4}>{nftData.name}</Text>
              <Text fontSize="md" mb={4}>{nftData.description}</Text>
              {nftData.attributes.map((attribute: NftAttribute, index: number) => (
                <Text key={index} fontSize="3xl" mb={2}>
                  {attribute.trait_type}: {attribute.value}
                </Text>
              ))}

            </Box>
          </Box>
          <Flex bg="rgba(0, 0, 0, 0.65)" borderRadius="2xl" p={0} mb={0} h="490px" justifyContent="center" alignItems="center">
            <Box
              flex={1}
              p={4}
              m={2}
              borderRadius="2xl"
              boxShadow="md"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <MiniMintBsc />
            </Box>
          </Flex>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default NFTProfilePagepolyV2;
