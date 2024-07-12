import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button, Select } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';

const NFT_CONTRACT_ADDRESS = '0x8Fc39D096204Ddc68f67aAfF0B63fE2207cB7738';
const REGISTER_CONTRACT_ADDRESS = '0xA7f396Bd16BDa67a1e9F02fbE4258036b05e6F47';

const nftAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTraitByTokenId",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const registerAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "trait",
        "type": "string"
      }
    ],
    "name": "registerNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const RegisterNFTPage = () => {
  const { open, close } = useWeb3Modal();
  const { account, connect, disconnect, isConnected } = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [trait, setTrait] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && provider) {
      fetchNFTs();
    }
  }, [account, provider]);

  const fetchNFTs = async () => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, signer);
      const userNFTs = await fetchUserNFTs(account, contract);
      setNfts(userNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const fetchUserNFTs = async (account, contract) => {
    const tokenIds = await getUserTokenIds(account, contract);
    const nfts = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const trait = await contract.getTraitByTokenId(tokenId);
        return { tokenId, trait, image: `/images/nfts/${tokenId}.png` };
      })
    );
    return nfts;
  };

  const getUserTokenIds = async (account, contract) => {
    // Placeholder function to simulate fetching user's token IDs
    // Replace this logic with actual call to fetch token IDs owned by the user
    try {
      const tokenIds = []; // Replace with actual logic
      // For example, you might use a function in your contract like balanceOf and tokenOfOwnerByIndex
      const balance = await contract.balanceOf(account);
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        tokenIds.push(tokenId.toString());
      }
      return tokenIds;
    } catch (error) {
      console.error('Error fetching token IDs:', error);
      return [];
    }
  };

  const registerNFT = async () => {
    if (!selectedNFT || !trait) return;
    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(REGISTER_CONTRACT_ADDRESS, registerAbi, signer);
      const tx = await contract.registerNFT(selectedNFT.tokenId, trait);
      await tx.wait();
      alert('NFT registered successfully!');
    } catch (error) {
      console.error('Error registering NFT:', error);
      alert('Failed to register NFT');
    }
    setLoading(false);
  };

  return (
    <>
      <Box position="relative" flex={1} p={0} m={0} display="flex" flexDirection="column" color="white">
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
        <Box flex={1} p={0} m={0} bg="rgba(0, 0, 0, 0.65)" display="flex" flexDirection="column" color="white">
          <Flex p={2} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
            <Image p={2} ml="4" src="/images/banner.png" alt="Heading" width="220px" />
            <Flex align="right">
              {!isConnected ? (
                <Button onClick={() => connect()}>Connect Wallet</Button>
              ) : (
                <Button onClick={() => disconnect()}>Disconnect</Button>
              )}
            </Flex>
          </Flex>
          <Box flex={1} p={4} m={0} display="flex" flexDirection="column" bgPosition="center" bgRepeat="no-repeat" bgSize="cover" color="white">
            <Flex flex={1} mt={2} p={4} borderRadius="2xl" textAlign="center" bg="rgba(0, 0, 0, 0.61)" flexWrap="wrap" alignItems="center" justifyContent="space-between">
              <Text mb={2} ml={4} textAlign="left" fontSize="lg" fontWeight="bolder">
                Register your NFT
              </Text>
            </Flex>
            <Flex justifyContent="center" p={4} flexWrap="wrap" position="relative">
              <Box flex={1} minW="300px" m={2} p={7} borderRadius="2xl" boxShadow="md" textAlign="center" bg="rgba(0, 0, 0, 0.61)">
                <Select placeholder="Select NFT" onChange={(e) => setSelectedNFT(nfts[e.target.value])}>
                  {nfts.map((nft, index) => (
                    <option key={nft.tokenId} value={index}>
                      <Flex alignItems="center">
                        <Image src={nft.image} alt={`NFT ${nft.tokenId}`} boxSize="30px" mr={2} />
                        <Text>{`Token ID: ${nft.tokenId}`}</Text>
                      </Flex>
                    </option>
                  ))}
                </Select>
                <Button mt={4} colorScheme="teal" isLoading={loading} onClick={registerNFT}>
                  Register NFT
                </Button>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default RegisterNFTPage;
