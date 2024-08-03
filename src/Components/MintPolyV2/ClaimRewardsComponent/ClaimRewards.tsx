import React, { useState, useEffect } from 'react';
import { Box, Text, Button, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import registerAbi from './registerAbi.json';

const ClaimReward = () => {
  const [claimCount, setClaimCount] = useState<number>(0);
  const [isClaimingEnabled, setIsClaimingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const registerContractAddress = '0x479eC1f036313ca1896A994f83D83910ffCbE531';

  useEffect(() => {
    if (address && walletProvider) {
      const checkClaimStatus = async () => {
        try {
          const provider = new ethers.BrowserProvider(walletProvider);
          const registerContract = new ethers.Contract(registerContractAddress, registerAbi, provider);

          const count = await registerContract.getClaimCountByUser(address);
          console.log('Claim count from contract:', count);

          setClaimCount(Number(count));

          const isEnabled = await registerContract.claimingEnabled();
          setIsClaimingEnabled(isEnabled);
        } catch (error) {
          console.error('Error checking claim status:', error);
          toast({
            title: 'Error',
            description: 'Could not retrieve claim information.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };

      checkClaimStatus();
    }
  }, [address, walletProvider, toast]);

  const handleClaim = async () => {
    if (!walletProvider || !address) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const registerContract = new ethers.Contract(registerContractAddress, registerAbi, signer);

      const tx = await registerContract.claimReward();
      await tx.wait();

      toast({
        title: 'Claim Successful',
        description: 'You have successfully claimed your reward!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setClaimCount(0); // Reset the claim count after claiming
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Claim Failed',
        description: 'There was an error while claiming your reward. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (claimCount === 0) return null;

  return (
    <Box
      p={4}
      m={4}
      bg="rgba(0, 0, 0, 0.75)"
      borderRadius="md"
      textAlign="center"
    >
      <Text fontSize="xl" mb={4}>
        You have {claimCount} valid claim{claimCount !== 1 ? 's' : ''} to collect!
      </Text>
      <Button
        colorScheme="orange"
        onClick={handleClaim}
        isLoading={loading}
        isDisabled={loading || claimCount === 0 || !isClaimingEnabled}
      >
        Claim Reward
      </Button>
      {!isClaimingEnabled && claimCount > 0 && (
        <Text fontSize="xl" mt={4}>
          Claiming is not enabled. Please wait for the claim date.
        </Text>
      )}
    </Box>
  );
};

export default ClaimReward;
