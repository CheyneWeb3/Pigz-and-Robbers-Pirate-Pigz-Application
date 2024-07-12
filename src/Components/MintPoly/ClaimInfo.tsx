import React, { useState, useEffect } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { ethers } from 'ethers';

const ABI = [
  {
    "inputs": [],
    "name": "getClaimValueByUser",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimingEnabled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0xA7f396Bd16BDa67a1e9F02fbE4258036b05e6F47';

const ClaimInfo = ({ userAddress }) => {
  const [claimValue, setClaimValue] = useState(0);
  const [maticPrice, setMaticPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [claimingEnabled, setClaimingEnabled] = useState(false);

  useEffect(() => {
    const fetchClaimData = async () => {
      if (!window.ethereum) {
        alert('Please install MetaMask to use this feature.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      try {
        const value = await contract.getClaimValueByUser(userAddress);
        setClaimValue(parseFloat(ethers.utils.formatEther(value)));

        const enabled = await contract.claimingEnabled();
        setClaimingEnabled(enabled);
      } catch (error) {
        console.error('Error fetching claim data:', error);
      }
    };

    const fetchMaticPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
        if (response.ok) {
          const data = await response.json();
          setMaticPrice(data['matic-network'].usd);
        } else {
          throw new Error('Failed to fetch MATIC price');
        }
      } catch (error) {
        console.error('Error fetching MATIC price:', error);
      }
    };

    fetchClaimData();
    fetchMaticPrice();
  }, [userAddress]);

  const totalUSD = claimValue * maticPrice;

  const claimRewards = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature.');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      setLoading(true);
      const transaction = await contract.claimReward();
      await transaction.wait();
      alert('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert(`Failed to claim rewards: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={4}
      m={4}
      bg="rgba(0, 0, 0, 0.65)"
      borderRadius="2xl"
      boxShadow="md"
      textAlign="center"
      color="white"
    >
      <Text fontSize="2xl" mb={2}>Your Valid Claims</Text>
      {claimingEnabled ? (
        <>
          <Text fontSize="xl" mb={2}>Claim Value: {claimValue} MATIC</Text>
          <Text fontSize="xl" mb={4}>Equivalent USD: ${totalUSD.toFixed(2)}</Text>
          <Button
            colorScheme="teal"
            isLoading={loading}
            onClick={claimRewards}
            isDisabled={claimValue === 0}
          >
            Claim Rewards
          </Button>
        </>
      ) : (
        <Text fontSize="xl" mb={4}>Claiming is not enabled</Text>
      )}
    </Box>
  );
};

export default ClaimInfo;
