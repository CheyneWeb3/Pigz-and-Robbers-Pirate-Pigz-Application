import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button, Link } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import Footer from './Components/Footer/Footer';

const HomePage = () => {
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
      box-shadow: 0 0 10px purple;
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
    text-shadow: 1px 1px 2px white, 0 0 1em white, 0 0 0.2em white;
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


          <Flex p="5px" bg="rgba(0, 0, 0, 0.61)" justifyContent="right" flexWrap="wrap">
            <w3m-button />
          </Flex>

      </Box>
    </>
  );
};

export default HomePage;
