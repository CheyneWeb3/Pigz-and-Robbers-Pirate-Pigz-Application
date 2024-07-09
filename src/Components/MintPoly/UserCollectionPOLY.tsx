import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Text,
  useToast,
  Flex,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import nftMintAbi from './mintBscAbi.json';

const NFTMINT_CONTRACT_ADDRESS = '0x8Fc39D096204Ddc68f67aAfF0B63fE2207cB7738';
const RPC_PROVIDER = 'https://polygon-rpc.com';
const METADATA_BASE_URL = 'https://raw.githubusercontent.com/ArielRin/Pigz-and-Robbers-Pirate-Pigz-Application/master/public/137nftdata/Metadata/';
const MAX_TOKEN_ID = 300;
const MATIC_PER_CLAIM = 6;

const fetchMetadata = async (tokenId: number) => {
  try {
    const response = await fetch(`${METADATA_BASE_URL}${tokenId}.json`);
    if (response.ok) {
      const metadata = await response.json();
      const traits = metadata.attributes.map((attr: { trait_type: string, value: string }) => attr.value);
      return traits;
    } else {
      throw new Error('Failed to fetch metadata');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return [];
  }
};

const fetchMaticPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
    if (response.ok) {
      const data = await response.json();
      return data['matic-network'].usd;
    } else {
      throw new Error('Failed to fetch MATIC price');
    }
  } catch (error) {
    console.error('Error fetching MATIC price:', error);
    return 0;
  }
};

interface Nft {
  tokenId: number;
  owner: string;
  traits: string[];
}

interface Claim {
  address: string;
  count: number;
}

function ValidClaimsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [validClaims, setValidClaims] = useState<Claim[]>([]);
  const [totalValidClaims, setTotalValidClaims] = useState(0);
  const [addressCount, setAddressCount] = useState(0); // State to store the count of addresses
  const [maticPrice, setMaticPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the current MATIC price
        const price = await fetchMaticPrice();
        setMaticPrice(price);

        const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
        const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
        const nftList: Nft[] = [];

        const tokenFetchPromises = [];
        for (let i = 0; i < MAX_TOKEN_ID; i++) {
          tokenFetchPromises.push(
            (async () => {
              try {
                const owner = await contract.ownerOf(i);
                const traits = await fetchMetadata(i);
                nftList.push({ tokenId: i, owner, traits });
              } catch (err) {
                // Ignore errors for tokens that don't exist
              }
            })()
          );
        }

        await Promise.all(tokenFetchPromises);

        const addressTraitsMap: { [key: string]: string[] } = {};
        nftList.forEach(({ owner, traits }) => {
          if (!addressTraitsMap[owner]) {
            addressTraitsMap[owner] = [];
          }
          addressTraitsMap[owner].push(...traits);
        });

        const claims: Claim[] = Object.entries(addressTraitsMap)
          .map(([address, traits]) => {
            const traitsCount: { [key: string]: number } = { 'Pirate Ship': 0, 'Tavern': 0, 'Island': 0 };
            traits.forEach(trait => {
              if (traitsCount[trait] !== undefined) {
                traitsCount[trait]++;
              }
            });
            const minCount = Math.min(...Object.values(traitsCount));
            return { address, count: minCount };
          })
          .filter(claim => claim.count > 0);

        setValidClaims(claims);

        const totalClaims = claims.reduce((sum, claim) => sum + claim.count, 0);
        setTotalValidClaims(totalClaims);
        setAddressCount(claims.length); // Set the count of addresses

      } catch (error) {
        toast({
          title: 'Error Fetching NFTs',
          description: 'There was an issue fetching NFTs from the contract.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const totalValueMatic = totalValidClaims * MATIC_PER_CLAIM;
  const totalValueUSD = totalValueMatic * maticPrice;

  return (
    <Box
      position="relative"
      flex={1}
      p={0}
      m={0}
      display="flex"
      flexDirection="column"
    >
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 1)"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Grid templateColumns={{ base: '1fr', md: '1fr 2fr 1fr' }} width="100%" mx="auto" marginTop="10px">
          <GridItem></GridItem>
          <GridItem display="flex" justifyContent="center">
            <Text fontSize="2xl" color="white" mt="18px">
              Pirate Pigz Valid Claims
            </Text>
          </GridItem>
          <GridItem display="flex" justifyContent="center"></GridItem>
          <GridItem display={{ base: 'flex', md: 'block' }} justifyContent="center">
            {/* Placeholder for any additional elements */}
          </GridItem>
        </Grid>

        <Box
          bg="rgba(0,0,0,1.0)"
          borderRadius="2xl"
          maxW="100%"
          textAlign="center"
          mt="4"
          mb="4"
        >
          <Text fontSize="xl" color="white">
            Number of Addresses with Valid Claims: {addressCount}
          </Text>
          <Text fontSize="xl" color="white">
            Total Valid Claims: {totalValidClaims}
          </Text>
          <Text fontSize="xl" color="white">
            Total Value: {totalValueMatic} MATIC (${totalValueUSD.toFixed(2)} USD)
          </Text>
        </Box>

        <Box
          bg="rgba(0,0,0,1)"
          maxW="90%"
          mx="auto"
          my="20px"
        >
          <Box
            bg="rgba(0,0,0,1)"
            width="100%"
            mx="auto"
          ></Box>

          {loading ? (
            <Text
              style={{
                marginBottom: '40px',
                color: 'white',
                padding: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              Please be patient while Loading...
            </Text>
          ) : validClaims.length === 0 ? (
            <Text
              style={{
                color: 'white',
                padding: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              No valid claims found.
            </Text>
          ) : (
            <VStack spacing="10px" align="center">
              {validClaims.map(({ address, count }) => (
                <Flex key={address} p="4" border="1px solid #7140d7" borderRadius="2xl" width="100%" minW="390px" maxW="500px" align="center">
                  <Box ml="4">
                    <Text color="white" mt="2">
                      {address}
                    </Text>
                    <Text color="white" mt="2">
                      Valid Claims: {count}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default ValidClaimsPage;
