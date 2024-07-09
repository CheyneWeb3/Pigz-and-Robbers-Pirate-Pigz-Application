import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Box, Flex, Button, Text, useToast, Image, keyframes, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import contractABI from './splitterABI.json';

const CONTRACT_ADDRESS = '0x74e157B6E8c6cba5A9bCe7731646f2Ba14B77912';
const TOKEN_DECIMALS = 18;
const TOKEN_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const ALPHA7_TOKEN_ADDRESS = '0x88CE0d545cF2eE28d622535724B4A06E59a766F0';
const ERCSWAPPER_DECIMALS = 9;

// Define keyframes for the glowing animation
const glow = keyframes`
  0% { border-color: blue; box-shadow: 0 0 5px blue; }
  50% { border-color: blue; box-shadow: 0 0 20px blue; }
  100% { border-color: blue; box-shadow: 0 0 5px blue; }
`;

const ClaimRewards = () => {
  const [rewardBalance, setRewardBalance] = useState('');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [alpha7TokenPriceUSD, setAlpha7TokenPriceUSD] = useState<number | null>(null);
  const [alpha7Balance, setAlpha7Balance] = useState<number | null>(null);
  const { address } = useAccount();
  const toast = useToast();

  const getContractWithSigner = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No crypto wallet found. Please install it.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  };

  const fetchRewardBalance = async () => {
    if (!address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const reward = await contract.rewards(address);
      const formattedReward = ethers.utils.formatUnits(reward, TOKEN_DECIMALS);
      console.log('Fetched reward balance:', formattedReward); // Log the reward balance
      setRewardBalance(formattedReward);
    } catch (error) {
      console.error('Error fetching reward balance:', error);
    }
  };

  const fetchTokenPrice = async () => {
    try {
      const response = await fetch(`https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${TOKEN_ADDRESS}`);
      const data = await response.json();
      console.log('API response:', data); // Log the full API response
      const price = data.data.attributes.token_prices[TOKEN_ADDRESS.toLowerCase()];
      console.log('Fetched token price:', price); // Log the token price
      setTokenPriceUSD(parseFloat(price));
    } catch (error) {
      console.error('Error fetching token price:', error);
      setTokenPriceUSD(null);
    }
  };

  const fetchAlpha7TokenPrice = async () => {
    try {
      const response = await fetch(`https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${ALPHA7_TOKEN_ADDRESS}`);
      const data = await response.json();
      console.log('Alpha7 API response:', data); // Log the full API response
      const price = data.data.attributes.token_prices[ALPHA7_TOKEN_ADDRESS.toLowerCase()];
      console.log('Fetched Alpha7 token price:', price); // Log the token price
      setAlpha7TokenPriceUSD(parseFloat(price));
    } catch (error) {
      console.error('Error fetching Alpha7 token price:', error);
      setAlpha7TokenPriceUSD(null);
    }
  };

  const fetchAlpha7TokenBalance = async () => {
    if (!address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const alpha7Contract = new ethers.Contract(ALPHA7_TOKEN_ADDRESS, [
        'function balanceOf(address owner) view returns (uint256)'
      ], provider);
      const balance = await alpha7Contract.balanceOf(address);
      const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, 9));
      console.log('Fetched ALPHA7 token balance:', formattedBalance); // Log the token balance
      setAlpha7Balance(formattedBalance);
    } catch (error) {
      console.error('Error fetching ALPHA7 token balance:', error);
    }
  };

  const claimRewards = async () => {
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.claimRewardsAndSwap();
      await tx.wait();
      toast({
        title: 'Success',
        description: 'Rewards claimed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchRewardBalance();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const claimRewardsAndSwap = async () => {
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.claimRewards();
      await tx.wait();
      toast({
        title: 'Success',
        description: 'Rewards claimed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchRewardBalance();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchRewardBalance();
    fetchTokenPrice();
    fetchAlpha7TokenPrice();
    fetchAlpha7TokenBalance();
  }, [address]);

  const usdValue = tokenPriceUSD !== null && !isNaN(parseFloat(rewardBalance))
    ? (parseFloat(rewardBalance) * tokenPriceUSD * 0.965).toFixed(2) // Apply 7% reduction
    : '0.00000000';

  const alpha7Value = alpha7TokenPriceUSD !== null && usdValue !== '0.00000000'
    ? (parseFloat(usdValue) / alpha7TokenPriceUSD * 0.965).toFixed(2) // Apply 7% reduction
    : '0.00000000';

  const showClaimAsBNB = alpha7Balance !== null && alpha7Balance >= 10000000;

  return (
    <>
      {rewardBalance && parseFloat(rewardBalance) > 0 && (
        <Box
          bg="rgba(0, 0, 0, 0.75)"
          p={15}
          borderRadius="2xl"
          boxShadow="xl"
          maxWidth="600px"
          marginBottom="5px"
          maxH="500px"
          width="100%"
          textAlign="center"
          border="5px"
          borderColor="blue"
          animation={`${glow} 2s infinite`} // Apply the glowing animation
        >
          <Flex color="white" alignItems="center" mb="1">
            <Image src="images/Betatesting.png" alt="" boxSize="90px" borderRadius="xl" mr="6" />
            <Box textAlign="left">
              <Text fontSize="lg" fontWeight="semibold" textAlign="left">
                You've got ALPHA7 Rewards!
              </Text>

              <Box mt="4" textAlign="left">
                <ChakraLink
                  as={RouterLink}
                  href="https://666962f9d755c4000854c3d6--glittery-caramel-80b519.netlify.app/game"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: '25px',
                    color: 'cyan',
                  }}
                >
                  Now Open to NFT Holders! Beta Testing Live Game Mechanics Click Here
                </ChakraLink>
              </Box>

              <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
                {alpha7Value} ALPHA7
              </Text>
              <Text fontSize="sm" fontWeight="normal" textAlign="left">
                ${usdValue} USD Value (approx {rewardBalance} BNB)
              </Text>
            </Box>
          </Flex>
          <Flex mb="4" alignItems="right" justifyContent="space-between">
            <Button
              mt="2"
              width="50%"
              bg="blue.400"
              textColor="white"
              _hover={{ bg: 'magenta' }}
              onClick={claimRewards}
            >
              Claim your Alpha7
            </Button>
            {showClaimAsBNB && (
              <>
                <Button
                  mt="2"
                  ml="2"
                  width="50%"
                  bg="#e3af09"
                  textColor="white"
                  _hover={{ bg: '#d09d4b' }}
                  onClick={claimRewardsAndSwap}
                >
                  Claim as BNB
                </Button>
              </>
            )}
          </Flex>
          {showClaimAsBNB && (
            <Flex mb="4" alignItems="center" justifyContent="space-between">
              <Text fontSize="sm" color="white" fontWeight="semibold" textAlign="left">
                Nice Dawg! Thanks for being a Solid Holder. As you hold more than 10,000,000 ALPHA7 tokens, you now have the ability to claim your rewards as BNB or ALPHA7.
                You earn more value with discounted claim fees. The "Claim as BNB" option is cheaper in gas then a standard transaction (approx 20cents).
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </>
  );
};

export default ClaimRewards;
