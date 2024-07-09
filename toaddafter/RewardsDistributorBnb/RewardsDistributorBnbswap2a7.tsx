import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Text, Box, Input, InputGroup, InputRightElement, useToast, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import contractABI from './splitterABI.json';
import nftABI from './nftAbi.json';
import excludeList from './excludeRewards'; // Import the exclusion list

import ClaimBNBswapA7 from '../Components/Bnb2A7ClaimBuy/ClaimBNBswapA7';
import DistBNB from './RewardsDistributorBnb';
import RegisterDawg from './registerdawg';
// <RegisterDawg />

import Footer from '../Components/Footer/Footer';
// <Footer />
const CONTRACT_ADDRESS = '0x74e157B6E8c6cba5A9bCe7731646f2Ba14B77912'; // bsctestnet
// const NFT_ADDRESS = '0xCa695FEB6b1b603ca9fec66aaA98bE164db4E660'; // New Addy for v2 Dawgz NFTs
const NFT_ADDRESS = '0xCa695FEB6b1b603ca9fec66aaA98bE164db4E660';

const TOKEN_DECIMALS = 18;
const BATCH_SIZE = 50;

const RewardsDistributor = () => {
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [nativeAmount, setNativeAmount] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [amountPerNFT, setAmountPerNFT] = useState<string>('');
  const [totalAllocatedRewards, setTotalAllocatedRewards] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [claimedRewards, setClaimedRewards] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [isValidAmount, setIsValidAmount] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [contractOwner, setContractOwner] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [eligibleNFTCount, setEligibleNFTCount] = useState<number>(0); // State to store eligible NFT count
  const [recipient, setRecipient] = useState<string>(''); // State for recipient address
  const [directRewardAmount, setDirectRewardAmount] = useState<string>(''); // State for direct reward amount
  const { address } = useAccount();
  const toast = useToast();

  const getContractWithSigner = async () => {
    if (!window.ethereum) {
      throw new Error('No crypto wallet found. Please install it.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  };

  const getNFTContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(NFT_ADDRESS, nftABI, provider);
  };

  const fetchContractOwner = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const owner = await contract.owner();
      setContractOwner(owner);
      setIsOwner(owner.toLowerCase() === address?.toLowerCase());
    } catch (error) {
      console.error('Error fetching contract owner:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contract owner. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchTotalSupply = async () => {
    try {
      const nftContract = await getNFTContract();
      const totalSupply = await nftContract.totalSupply();
      setTotalSupply(totalSupply);
      return totalSupply;
    } catch (error) {
      console.error('Error fetching total supply:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch total supply. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const balance = await contract.getRewardTokenBalance();
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch token balance. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchTotalAllocatedRewards = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const totalAllocated = await contract.getTotalAllocatedRewards();
      setTotalAllocatedRewards(totalAllocated);
      return totalAllocated;
    } catch (error) {
      console.error('Error fetching total allocated rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch total allocated rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchClaimedRewards = async (addresses: string[]) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      let totalClaimed = ethers.BigNumber.from(0);
      for (const addr of addresses) {
        const claimed = await contract.getClaimedRewards(addr);
        totalClaimed = totalClaimed.add(claimed);
      }

      setClaimedRewards(totalClaimed);
      return totalClaimed;
    } catch (error) {
      console.error('Error fetching claimed rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch claimed rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchNFTHolders = async () => {
    try {
      const nftContract = await getNFTContract();
      const totalSupply = await nftContract.totalSupply().then((supply: ethers.BigNumber) => supply.toNumber());
      const holderCounts: { [key: string]: number } = {};

      const fetchPromises = [];
      for (let index = 0; index < totalSupply; index++) {
        fetchPromises.push(
          nftContract.tokenByIndex(index).then(async (tokenId: ethers.BigNumber) => {
            const owner = await nftContract.ownerOf(tokenId);
            holderCounts[owner] = (holderCounts[owner] || 0) + 1;
          })
        );
      }

      await Promise.all(fetchPromises);

      return holderCounts;
    } catch (error) {
      console.error('Error fetching NFT holders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch NFT holders. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return {};
    }
  };

  const calculateAmountPerNFT = async () => {
    const balance = await fetchTokenBalance();
    const totalAllocated = await fetchTotalAllocatedRewards();
    const totalSupply = await fetchTotalSupply();

    const holderCounts = await fetchNFTHolders();
    const uniqueHolders = Object.keys(holderCounts);
    const totalClaimed = await fetchClaimedRewards(uniqueHolders);

    const unallocated = balance.add(totalClaimed).sub(totalAllocated);
    const a2 = parseFloat(ethers.utils.formatUnits(unallocated, TOKEN_DECIMALS));

    // Calculate eligible NFT count
    const eligibleHolders = uniqueHolders.filter(owner => !excludeList.includes(owner));
    const eligibleNFTCount = eligibleHolders.reduce((sum, owner) => sum + holderCounts[owner], 0);

    const amountPerNFTValue = eligibleNFTCount > 0 ? (a2 / eligibleNFTCount).toFixed(9) : '0';

    setAmountPerNFT(amountPerNFTValue);
    setRewardAmount(amountPerNFTValue); // Set rewardAmount to max by default
    setEligibleNFTCount(eligibleNFTCount);

    // Log statements for debugging
    console.log('Token Balance:', ethers.utils.formatUnits(balance, TOKEN_DECIMALS));
    console.log('Claimed Rewards:', ethers.utils.formatUnits(totalClaimed, TOKEN_DECIMALS));
    console.log('Total Allocated Rewards:', ethers.utils.formatUnits(totalAllocated, TOKEN_DECIMALS));
    console.log('Unallocated:', a2);
    console.log('Total Supply:', totalSupply.toNumber());
    console.log('Eligible NFT Count:', eligibleNFTCount);
    console.log('Amount Per NFT:', amountPerNFTValue);
  };

  const batchRewardAddresses = async (holders: string[], amounts: ethers.BigNumber[]) => {
    const contract = await getContractWithSigner();

    try {
      console.log('Sending batch reward transaction...');
      const tx = await contract.batchRewardAddresses(holders, amounts, {
        gasLimit: ethers.utils.hexlify(1500000), // Adjust the gas limit as necessary
      });
      await tx.wait();
      console.log('Batch reward transaction completed:', tx);

      toast({
        title: 'Success',
        description: 'Batch rewards sent successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Update total allocated rewards
      await fetchTotalAllocatedRewards();
      await calculateAmountPerNFT(); // Refresh data on the page
    } catch (error: any) {
      console.error('Error sending batch rewards:', error);
      const errorMessage = error.reason || error.data || error.message;
      toast({
        title: 'Error',
        description: `Failed to send batch rewards: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBatchRewards = async () => {
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      setIsValidAmount(false);
      setErrorMessage('Amount must be higher than zero');
      return;
    }

    if (parseFloat(rewardAmount) > parseFloat(amountPerNFT)) {
      setIsValidAmount(false);
      setErrorMessage('Value Too High!');
      return;
    } else {
      setIsValidAmount(true);
      setErrorMessage('');
    }

    console.log('Starting batch reward process...');
    const holderCounts = await fetchNFTHolders();
    const uniqueHolders = Object.keys(holderCounts);

    // Exclude addresses in the exclusion list
    const eligibleHolders = uniqueHolders.filter(owner => !excludeList.includes(owner));

    // Convert rewardAmount to wei
    const rewardAmountWei = ethers.utils.parseUnits(rewardAmount, 'ether');

    const batches = [];
    for (let i = 0; i < eligibleHolders.length; i += BATCH_SIZE) {
      const batchHolders = eligibleHolders.slice(i, i + BATCH_SIZE);
      const batchAmounts = batchHolders.map(holder => rewardAmountWei.mul(holderCounts[holder]));
      batches.push({ holders: batchHolders, amounts: batchAmounts });
    }

    for (const batch of batches) {
      await batchRewardAddresses(batch.holders, batch.amounts);
    }
  };

  const handleSendNativeTokens = async () => {
    if (!nativeAmount || parseFloat(nativeAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount of native tokens to send.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const contract = await getContractWithSigner();
      const amountInWei = ethers.utils.parseUnits(nativeAmount, 'ether');

      const tx = await contract.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: amountInWei,
      });
      await tx.wait();
      console.log('Native token transfer successful:', tx);

      toast({
        title: 'Success',
        description: 'Native tokens sent to the contract successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh token balance
      await fetchTokenBalance();
    } catch (error: any) {
      console.error('Error sending native tokens:', error);
      const errorMessage = error.reason || error.data || error.message;
      toast({
        title: 'Error',
        description: `Failed to send native tokens: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDirectReward = async () => {
    // Validate the recipient address and reward amount
    if (!recipient || !directRewardAmount) {
      toast({
        title: 'Error',
        description: 'Please enter both recipient address and reward amount.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Get the contract instance with the signer
      const contract = await getContractWithSigner();
      const amountInWei = ethers.utils.parseUnits(directRewardAmount, 'ether'); // Convert to wei

      // Log the amount and recipient before sending the transaction
      console.log(`Sending ${directRewardAmount} BNB to ${recipient}`);

      // Call the rewardAddressDirectly function on the contract
      const tx = await contract.rewardAddressDirectly(recipient, amountInWei);
      await tx.wait();
      console.log('Direct reward transaction completed:', tx);

      // Show success toast message
      toast({
        title: 'Success',
        description: 'Reward sent successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await fetchTokenBalance();
    } catch (error: any) {
      console.error('Error sending reward:', error);
      const errorMessage = error.reason || error.data?.message || error.message;
      toast({
        title: 'Error',
        description: `Failed to send reward: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTotalSupply();
    calculateAmountPerNFT();
  }, [address]);

  useEffect(() => {
    setRewardAmount(amountPerNFT);
  }, [amountPerNFT]);

  useEffect(() => {
    if (address) {
      fetchContractOwner();
    }
  }, [address]);

  const handleMaxButtonClick = () => {
    setRewardAmount(amountPerNFT);
    setIsValidAmount(true);
    setErrorMessage('');
  };

  const handleRewardAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRewardAmount(value);
    if (parseFloat(value) <= 0) {
      setIsValidAmount(false);
      setErrorMessage('Amount must be higher than zero');
    } else if (parseFloat(value) > parseFloat(amountPerNFT)) {
      setIsValidAmount(false);
      setErrorMessage('Value Too High!');
    } else {
      setIsValidAmount(true);
      setErrorMessage('');
    }
  };

  const handleDirectRewardAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectRewardAmount(e.target.value);
  };

  const handleNativeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNativeAmount(e.target.value);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
  };

  const unallocated = (
    parseFloat(ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)) +
    parseFloat(ethers.utils.formatUnits(claimedRewards, TOKEN_DECIMALS)) -
    parseFloat(ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS))
  ).toFixed(9); // Update to toFixed(9)


    const [showText, setShowText] = useState(false);

    const toggleText = () => {
      setShowText(!showText);
    };


  return (
    <Box
      flex={1}
      p={0}
      m={0}
      display="flex"
      flexDirection="column"
      bg="rgba(255, 255, 255, 0.3)"
      bgImage="url('/images/toastBkg.png')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 0.9)"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Box
          bg="rgba(0,0,0,0)"
          padding="5px"
          width="100%"
          mx="auto"
          marginTop="0px"
        >
        </Box>
          <ConnectButton />

        <Box
          marginBottom="40px"
          bg="rgba(255, 255, 255, 0.1)"
          borderRadius="2xl"
          padding="20px"
          mx="auto"
          my="10px"
          boxShadow="xl"
          maxWidth="900px"
          width="100%"
          textAlign="left"
          border="2px"
          borderColor="blue"
        >
          <Tabs align="center" variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>NFT Rewards Processing</Tab>
                <Tab>BNB Payments</Tab>
              <Tab>Other Admin Functions</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box

                textAlign="left"
                >

                  <Text style={{ fontWeight: 'bolder' }} color="white" fontSize="3xl" mb="4">Alpha7 Claim Processing</Text>

                                    <Box mb="4">
                                      <Text style={{ color: 'white', fontWeight: 'bold' }} fontSize="lg">NFT Rewards Contract: {CONTRACT_ADDRESS}</Text>
                                      <Text color="white" fontSize="md">Available Balance in Contract: {unallocated} BNB</Text>

                                    </Box>

                                    <Box mb="4">
                         {showText ? (
                           <>
                             <Text style={{ fontWeight: 'bolder' }} color="white" fontSize="md" mb="4">
                               BNB will be automatically deposited from NFT reflections and a percentage of NFT sales into the token contract. Team funds can also be sent directly to this address in BNB, with admins processing the BNB amounts to ALPHA7 for user claims.
                             </Text>
                             <Text style={{ fontWeight: 'bolder' }} color="white" fontSize="md" mb="4">
                               The claim function includes a swapper that buys Alpha7 when users claim, increasing volume. Users receive Alpha7 if their balance is below 10 million Alpha7 tokens. If the balance is higher, users can claim in BNB or Alpha7 on the dapp.
                             </Text>
                             <Text style={{ fontWeight: 'bolder' }} color="white" fontSize="md" mb="4">
                               Project admins can use funds from contract to gift or reward any wallet using the Direct Reward Function, allowing the address to claim rewards on the dapp.
                             </Text>
                        <Box mb="4">
                          <Text color="white" fontSize="sm">Step 1: Connect as Alpha7 Project Admin wallet to the dapp.</Text>
                          <Text color="white" fontSize="sm">Step 2: To Fund Claims. Send BNB tokens to contract address directly.</Text>
                          <Text color="white" fontSize="sm">Step 3: Set the amount of Tokens to distribute to NFT Claims.</Text>
                          <Text color="white" fontSize="sm">Step 4: Tap the Process Claims Button and confirm transaction.</Text>
                        </Box>
                           </>
                         ) : (
                           <Text style={{ fontWeight: 'bolder' }} color="white" fontSize="md" mb="4">
                             How to use this page and an explanation of how it operates click below.
                           </Text>
                         )}
                         <Button onClick={toggleText} colorScheme="blue">
                           {showText ? 'Read less' : 'Read more'}
                         </Button>
                       </Box>

                  <Box mb="4">
                    <Text color="white" fontSize="md">Eligible NFTs (Excluding Excluded Addresses): {eligibleNFTCount}</Text>
                    <Text color="white" fontSize="md">Max tokens you can process per NFT: {amountPerNFT} BNB</Text>
                    <InputGroup mb="2">
                      <Input
                        placeholder="Reward Amount (BNB)"
                        value={rewardAmount}
                        onChange={handleRewardAmountChange}
                        textColor="white"
                        borderColor={isValidAmount ? 'blue' : 'red'}
                      />
                      <InputRightElement width="6rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={handleMaxButtonClick}
                          bg="blue"
                          textColor="white"
                          _hover={{ bg: '#e8bf72' }}
                        >
                          Set Max
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <Button
                      onClick={handleBatchRewards}
                      textColor="white"
                      bg={isValidAmount ? 'blue' : 'red'}
                      _hover={{ bg: isValidAmount ? '#e8bf72' : 'red' }}
                      isDisabled={!isValidAmount}
                    >
                      {isValidAmount ? 'Process Claims' : errorMessage}
                    </Button>
                    <Text color="white" fontSize="sm">Note: You can disburse less than max if needed.</Text>
                    <Box mt="4" mb="4">
                      <Text color="white" fontSize="md">Total Allocated to claim to date: {parseFloat(ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS)).toFixed(9)} BNB</Text>
                      <Text color="white" fontSize="md">Total BNB Balance in Contract: {parseFloat(ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)).toFixed(9)} BNB</Text>
                      <Text color="white" fontSize="md">Available Balance in Contract: {unallocated} BNB</Text>

                    </Box>
                  </Box>
                  <Box mb="4">
                    <Text color="white" fontSize="lg" mb="2">Direct Reward</Text>
                    <InputGroup mb="2">
                      <Input
                        placeholder="Recipient Address"
                        value={recipient}
                        onChange={handleRecipientChange}
                        textColor="white"
                        borderColor="blue"
                      />
                    </InputGroup>
                    <InputGroup mb="2">
                      <Input
                        placeholder="Reward Amount (BNB)"
                        value={directRewardAmount}
                        onChange={handleDirectRewardAmountChange}
                        textColor="white"
                        borderColor="blue"
                      />
                    </InputGroup>
                    <Button
                      onClick={handleDirectReward}
                      bg="blue"
                      textColor="white"
                      _hover={{ bg: '#e8bf72' }}
                    >
                      Send Direct Reward
                    </Button>
                  </Box>
                </Box>

                                                    <Box mb="4">
                                                      {address && (
                                                        <>
                                                          <Text fontSize="sm" style={{ fontWeight: 'bold' }} color={isOwner ? 'green.500' : 'red.500'}>
                                                            {isOwner ? `Welcome Contract Owner: ${address}` : `Connected wallet is not the owner of the contract: ${address}`}
                                                          </Text>
                                                        </>
                                                      )}
                                                    </Box>

                <ClaimBNBswapA7 />
              </TabPanel>


              <TabPanel>
              <DistBNB />
            </TabPanel>
            <TabPanel>
              <RegisterDawg />
            </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
       <Footer />
    </Box>
  );
};

export default RewardsDistributor;
