import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button, Link } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import Footer from './Components/Footer/Footer';

const NewPage = () => {
  const [tokenData, setTokenData] = useState<any>(null);

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
          <Flex p="5px" bg="rgba(0, 0, 0, 0.61)" justifyContent="right" flexWrap="wrap">
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
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Image src="images/piratepigzsm.png" alt="header" mx="auto" width="60%" minW="200px" mt="28px" />
              </Box>
              <Box
                flex={1}
                minW="300px"
                m={2}
                p={7}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
              <Image src="images/pigznrobbers.png" alt="header" mx="auto"  width="60%" minW="200px" mt="28px" />
              </Box>
            </Flex>
            <Box p={4}>
              <Box
                flex={1}
                m={2}
                p={4}
                bg="rgba(255, 20, 147, 0.0)"
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Text

                mb="200px"
                fontSize="xl">Small paragram or instruct here to word up with project</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default NewPage;
