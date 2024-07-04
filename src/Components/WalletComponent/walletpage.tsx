import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Button, Text, Box, useToast, keyframes, VStack, Flex, Image, IconButton, Collapse, Grid, GridItem, Link, Spinner, Center, Switch, FormControl, FormLabel
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import dawgRegistrationAbi from './dawgRegistrationAbi.json';
import userRegistryAbi from './userRegistryAbi.json';
import nftAbi from './abiNFTFile.json';
import { defaultTokenIcon } from './tokens';

const DAWG_REGISTRATION_CONTRACT_ADDRESS = "0x6B49F7B1239F5487566815Ce58ec0396b2E363e7";
const USER_REGISTRY_CONTRACT_ADDRESS = "0x37922C5C3DEEF8A82492E6855EE08307a8D27278";
const NFT_CONTRACT_ADDRESS = "0xCa695FEB6b1b603ca9fec66aaA98bE164db4E660";
const WBNB_ADDRESS = '0xEb54dACB4C2ccb64F8074eceEa33b5eBb38E5387';

const glow = keyframes`
  10% { border-color: purple; box-shadow: 0 0 5px purple; }
  50% { border-color: purple; box-shadow: 0 0 20px purple; }
  100% { border-color: purple; box-shadow 0 0 50px purple; }
`;

const RegisterNFT: React.FC = () => {
  const [balances, setBalances] = useState<{ [key: string]: { balance: string; usdValue: string; price: string; address: string } }>({});
  const [totalUSDValue, setTotalUSDValue] = useState<number>(0);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showOnlyBalances, setShowOnlyBalances] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    const initializeConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        try {
          const accounts = await provider.send("eth_requestAccounts", []);
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            console.log("Connected to wallet with address:", accounts[0]);
          }
        } catch (error) {
          notify.error('Please connect to MetaMask.');
          console.error("Error connecting to MetaMask:", error);
        }

        (window.ethereum as any).on('accountsChanged', async (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            console.log("Account changed, new address:", accounts[0]);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        });

        (window.ethereum as any).on('chainChanged', () => {
          window.location.reload();
        });
      } else {
        notify.error('Wallet not Detected. Try Refreshing or Install a Wallet to use this app.');
      }
    };

    initializeConnection();
  }, []);

  const getContract = async (contractAddress: string, abi: any) => {
    if (!window.ethereum) {
      throw new Error('No crypto wallet found. Please install it.');
    }

    console.log(`Getting contract at ${contractAddress}`);
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const fetchWDEGENPrice = async () => {
    try {
      const response = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/degenchain/token_price/0xEb54dACB4C2ccb64F8074eceEa33b5eBb38E5387');
      const data = await response.json();
      console.log("Fetched WDEGEN price:", data.data.attributes.token_prices['0xeb54dacb4c2ccb64f8074eceea33b5ebb38e5387']);
      return data.data.attributes.token_prices['0xeb54dacb4c2ccb64f8074eceea33b5ebb38e5387'];
    } catch (error) {
      console.error("Failed to fetch WDEGEN price:", error);
    }
  };

  const fetchTokenPrices = async (tokenAddresses: string[]) => {
    try {
      const filteredTokenAddresses = tokenAddresses.filter(address =>
        address.toLowerCase() !== '0x401cD27B11e64527Cc09bCAD1feBCF8fCAe8e945'.toLowerCase() &&
        address.toLowerCase() !== '0xEb54dACB4C2ccb64F8074eceEa33b5eBb38E5387'.toLowerCase()
      );

      const url = `https://api.geckoterminal.com/api/v2/simple/networks/degenchain/token_price/${filteredTokenAddresses.join(',')}`;
      console.log('API URL for fetching token prices:', url);

      const response = await fetch(url);
      const data = await response.json();
      console.log('Fetched token prices:', data);
      return data.data.attributes.token_prices;
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
    }
  };

  const fetchTokenList = async () => {
    try {
      const response = await fetch('/tokensUserList.json');
      const tokens = await response.json();
      console.log("Fetched token list:", tokens);

      // Add the native token to the list
      const nativeToken = {
        symbol: 'DEGEN',
        address: 'native',
        name: 'Degen Chain',
        icon: 'https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png?size=lg&key=e17c44',
        decimals: 18
      };

      setTokens([nativeToken, ...tokens]);
      fetchTokenBalances([nativeToken, ...tokens]);
    } catch (error) {
      console.error('Error fetching token list:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token list. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchTokenBalances = async (tokens: any[]) => {
    try {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log("Fetching token balances for address:", address);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const balances: { [key: string]: { balance: string; usdValue: string; price: string; address: string } } = {};
      const tokenAddresses = tokens.map(token => token.address);

      const balance = await provider.getBalance(address);
      const formattedBalance = parseFloat(ethers.formatEther(balance));
      console.log("DEGEN balance:", formattedBalance);

      const wdegenPrice = await fetchWDEGENPrice();

      if (formattedBalance > 0) {
        const usdValue = formattedBalance * parseFloat(wdegenPrice);
        balances['DEGEN'] = {
          balance: formattedBalance > 10 ? formattedBalance.toFixed(0) : formattedBalance.toFixed(4),
          usdValue: usdValue.toFixed(5),
          price: wdegenPrice,
          address: "native"
        };
      }

      for (const token of tokens) {
        if (token.symbol === 'DEGEN') continue;

        const tokenContract = new ethers.Contract(token.address, [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ], await provider.getSigner());

        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
        console.log(`Balance for token ${token.symbol}:`, formattedBalance);

        if (formattedBalance > 0) {
          balances[token.symbol] = {
            balance: formattedBalance > 10 ? formattedBalance.toFixed(0) : formattedBalance.toFixed(4),
            usdValue: "0.00",
            price: "0.00",
            address: token.address
          };
        }
      }

      console.log('Token balances before pricing:', balances);

      const prices = await fetchTokenPrices(tokenAddresses);

      let totalValue = 0;
      for (const symbol in balances) {
        const token = tokens.find(t => t.symbol === symbol);
        if (token) {
          const price = prices[token.address.toLowerCase()];
          console.log(`Price for ${symbol}:`, price);
          if (price) {
            const usdValue = parseFloat(balances[symbol].balance) * parseFloat(price);
            balances[symbol].usdValue = usdValue.toFixed(2);
            balances[symbol].price = price;
            totalValue += usdValue;
          }
        }
      }

      if (balances['DEGEN']) {
        totalValue += parseFloat(balances['DEGEN'].usdValue);
      }

      setBalances(balances);
      setTotalUSDValue(totalValue);
      console.log('Final token balances with USD values:', balances);
      console.log('Total USD value of all tokens:', totalUSDValue);
    } catch (error) {
      console.error("Failed to fetch token balances:", error);
      toast({
        title: "Error",
        description: "Failed to fetch token balances. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Contract address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleTokenDetails = (symbol: string) => {
    setExpandedToken(prev => (prev === symbol ? null : symbol));
  };

  const addToWallet = async (token: any) => {
    try {
      await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.icon,
          },
        },
      });
      toast({
        title: "Token Added",
        description: `${token.symbol} has been added to your wallet`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${token.symbol} to your wallet`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchTokenList();
    }
  }, [isConnected]);

  const filteredTokens = showOnlyBalances
    ? tokens.filter(token => parseFloat(balances[token.symbol]?.balance) > 0)
    : tokens;

  return (
    <VStack color="white" spacing={4} align="flex-start" width="100%">
      <Box w="100%" p={6} borderRadius="xl" bg="rgba(0, 0, 0, 0.7)">
        {loading ? (
          <>
            <Text fontSize="md" textAlign="left" fontWeight="bold" mt="4">Please be patient while calculating your listed Degen Chain tokens and balances...</Text>
            <Center>
              <Spinner size="xl" color="purple.500" mt="4" />
            </Center>
          </>
        ) : (
          <>
            <Box p={4} bg="rgba(0, 0, 0, 0)">
              <Text fontSize="xl" color="white" fontWeight="semibold" textAlign="left">
              Track the Balance of your Degen Chain Tokens Use $PURP Balance Tracker on any connected address!
              </Text>
            </Box>
            <Text fontSize="md" mt="1" textAlign="right" fontWeight="bold">Your Listed Tokens USD Value</Text>
            <Text fontSize="5xl" textAlign="right" fontWeight="bold" > ${totalUSDValue.toFixed(3)} USD</Text>
            <Text  fontSize="sm" color="white" fontWeight="semibold" textAlign="left">
              Click the tokens to view more details
            </Text>
            <FormControl display="flex" alignItems="center" >
              <FormLabel htmlFor="show-balances" mt="20px" mb="0">
                Show only your balances
              </FormLabel>
              <Switch id="show-balances" mt="20px"  colorScheme="purple" isChecked={showOnlyBalances} onChange={() => setShowOnlyBalances(!showOnlyBalances)} />
            </FormControl>
          </>
        )}
      </Box>
      {!loading && (
        <VStack bg="rgba(0, 0, 0, 0.7)" p="4" color="white" borderRadius="xl" spacing={4} align="flex-start" width="100%">
          <Grid templateColumns="1fr 3fr 1fr 2fr" gap={4} width="100%">
            {filteredTokens.map((token) => {
              const tokenIcon = token.icon || defaultTokenIcon;
              const symbol = token.symbol;
              return (
                <React.Fragment key={token.address}>
                  <GridItem colSpan={4} onClick={() => toggleTokenDetails(symbol)} cursor="pointer">
                    <Flex align="center">
                      <Image src={token.icon || defaultTokenIcon} alt={token.name} boxSize="40px" borderRadius="100%" />
                      <Text fontWeight="bold" textAlign="left" ml="5" flex="1">{token.symbol}</Text>
                      <Text textAlign="right" mr="4">{balances[symbol]?.balance || 0}</Text>
                      <Text fontWeight="bold" textAlign="right">${balances[symbol]?.usdValue || 0} USD</Text>
                    </Flex>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Collapse in={expandedToken === symbol}>
                      <Box
                        p={2}
                        bg="rgba(0, 0, 0, 0.55)"
                        borderRadius="xl"
                        boxShadow="xl"
                        border="5px"
                        borderColor="purple"
                        animation={`${glow} 2s infinite`}
                        width="100%"
                      >
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                          <Box order={{ base: 2, md: 1 }}>
                            <Image ml="8" mt="5" src={token.icon || defaultTokenIcon} alt={token.name} boxSize="150px" borderRadius="100%" />
                            <Flex align="left">
                              <Text mt="4" fontWeight="bold" ml="5" fontSize="xl" textAlign="left">{token.name}</Text>
                            </Flex>
                            <Flex mt="2" align="left">
                              <Text fontWeight="bold" ml="5" fontSize="4xl" textAlign="left">{token.symbol}</Text>
                            </Flex>
                            <Flex mt="2" mb="7" ml="5" align="right">
                              <Button as={Link} href={`https://dex.swapdegen.tips/#/swap?outputCurrency=${balances[symbol]?.address}`} isExternal rightIcon={<ExternalLinkIcon />} colorScheme="purple" size="lg">
                                Buy Now
                              </Button>
                            </Flex>
                            {token.chart && (
                              <Flex mt="2" mb="9" ml="5" align="left">
                                <Link href={token.chart} isExternal>
                                  Chart <ExternalLinkIcon mx="2px" />
                                </Link>
                              </Flex>
                            )}
                            <Flex mt="9" align="left">
                              <Text ml="5" fontSize="sm" textAlign="left">{token.address}</Text>
                            </Flex>
                            <Flex ml="5" mt="2" align="left">
                              <IconButton
                                icon={<CopyIcon />}
                                colorScheme="purple"
                                aria-label="Copy Contract Address"
                                size="sm"
                                onClick={() => handleCopy(token.address)}
                              />
                              <Button ml="1" colorScheme="purple" size="sm" onClick={() => addToWallet(token)}>
                                Add to Wallet
                              </Button>
                            </Flex>
                            <Flex mt="4" ml="5" align="left">
                              <Link href={`https://explorer.degen.tips/token/${token.address}`} isExternal>
                                Degen Explorer <ExternalLinkIcon mx="2px" />
                              </Link>
                            </Flex>
                            {token.website && (
                              <Flex mt="2" ml="5" align="left">
                                <Link href={token.website} isExternal>
                                  Website <ExternalLinkIcon mx="2px" />
                                </Link>
                              </Flex>
                            )}
                            {token.telegram && (
                              <Flex mt="2" mb="9" ml="5" align="left">
                                <Link href={token.telegram} isExternal>
                                  Telegram <ExternalLinkIcon mx="2px" />
                                </Link>
                              </Flex>
                            )}
                          </Box>
                          <Box order={{ base: 1, md: 2 }}>
                            <Text mt="2" fontWeight="bold" fontSize="lg" mr="5" textAlign="right">Current Token Price</Text>
                            <Text mt="0" fontWeight="bold" fontSize="xl" mr="5" textAlign="right">${balances[symbol]?.price}</Text>
                            <Text mt="4" fontWeight="bold" fontSize="lg" mr="5" textAlign="right">Your Token Balance</Text>
                            <Text mt="0" fontWeight="bold" fontSize="4xl" mr="5" textAlign="right">{balances[symbol]?.balance} {token.symbol}</Text>
                            <Text mt="4" fontWeight="bold" fontSize="lg" mr="5" textAlign="right">Your Bags Value in USD</Text>
                            <Text mt="0" fontWeight="bold" fontSize="4xl" mr="5" textAlign="right">${balances[symbol]?.usdValue}</Text>
                          </Box>
                        </Grid>
                      </Box>
                    </Collapse>
                  </GridItem>
                </React.Fragment>
              );
            })}
          </Grid>
        </VStack>
      )}
    </VStack>
  );
};

export default RegisterNFT;
