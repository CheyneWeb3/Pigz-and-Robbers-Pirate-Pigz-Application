import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { css, keyframes } from '@emotion/react';
import Footer from '../Footer/Footer';
import MiniMintBsc from '../MintNowMini/MintNow2nopadding';

interface NftData {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

const NFTProfilePage = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [nftData, setNftData] = useState<NftData | null>(null);

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response = await fetch(`https://pigzandrobbers.meta.rareboard.com/api/${tokenId}.json`);
        const data = await response.json();
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      }
    };

    fetchNFTData();
  }, [tokenId]);

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

  const textShadowStyle = css`
    text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em black;
  `;

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
              <Image p={2} ml="4" src="/images/banner.png" alt="Heading" width="220px" />
            </Link>
            <w3m-button />
          </Flex>

          <Flex bg="rgba(0, 0, 0, 0.65)" borderRadius="2xl" p={4} m={2} h="140px" justifyContent="center" flexWrap="wrap">
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
              <Image borderRadius="2xl" mx="auto" src={`https://ipfs.io/ipfs/${nftData.image.split('ipfs://')[1]}`} alt={nftData.name} width="75%" />
            </Box>
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4} css={textShadowStyle}>{nftData.name}</Text>
              <Text fontSize="md" mb={4}>{nftData.description}</Text>
              {nftData.attributes.map((attribute, index) => (
                <Text key={index} fontSize="3xl" mb={2} css={textShadowStyle}>
                  {attribute.trait_type}: {attribute.value}
                </Text>
              ))}
            </Box>
          </Box>

          <Flex bg="rgba(0, 0, 0, 0.65)" borderRadius="2xl" p={0} mb={0} h="340px" justifyContent="center" flexWrap="wrap">
            <MiniMintBsc />
          </Flex>

        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default NFTProfilePage;
