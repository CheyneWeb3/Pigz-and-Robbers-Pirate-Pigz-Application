import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { css, keyframes } from '@emotion/react';
import { ethers } from 'ethers';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Footer/Footer';
import MiniMintPoly from '../MintNowMiniPoly/MintNow2nopadding';
import MiniMintBsc from '../MintNowMini/MintNow2nopadding';

const NFT_CONTRACT_ABI = [
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

const REGISTRATION_CONTRACT_ABI = [
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

const NFT_CONTRACT_ADDRESS = '0x8Fc39D096204Ddc68f67aAfF0B63fE2207cB7738';
const REGISTRATION_CONTRACT_ADDRESS = '0xA7f396Bd16BDa67a1e9F02fbE4258036b05e6F47';
const POLYGON_CHAIN_ID = '0x89';

interface NftAttribute {
  trait_type: string;
  value: string;
}

interface NftData {
  name: string;
  description: string;
  attributes: NftAttribute[];
}

const NFTProfilePage = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [nftData, setNftData] = useState<NftData | null>(null);
  const [trait, setTrait] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { account, isConnected } = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response = await fetch(`https://raw.githubusercontent.com/ArielRin/Pigz-and-Robbers-Pirate-Pigz-Application/master/public/137nftdata/Metadata/${tokenId}.json`);
        const data: NftData = await response.json();
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      }
    };

    fetchNFTData();
  }, [tokenId]);

  useEffect(() => {
    const checkNetwork = async () => {
      if (!provider) return;

      const network = await provider.getNetwork();
      if (network.chainId !== parseInt(POLYGON_CHAIN_ID, 16)) {
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: POLYGON_CHAIN_ID }]);
          console.log('Switched to Polygon network');
        } catch (switchError) {
          console.error('Error switching to Polygon network:', switchError);
          toast.error('Error switching to Polygon network.');
        }
      }
    };

    const fetchTrait = async () => {
      if (!provider) {
        console.error('Provider is not available.');
        return;
      }
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      try {
        const fetchedTrait = await contract.getTraitByTokenId(tokenId);
        setTrait(fetchedTrait);
      } catch (error) {
        console.error('Error fetching trait from contract:', error);
        toast.error('Error fetching trait from contract.');
      }
    };

    if (provider) {
      checkNetwork();
      fetchTrait();
    }
  }, [provider, tokenId]);


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
            <Flex align="right">
              <w3m-button />
            </Flex>
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
              <Image
                borderRadius="2xl"
                mx="auto"
                src={`https://raw.githubusercontent.com/ArielRin/Pigz-and-Robbers-Pirate-Pigz-Application/master/public/137nftdata/Images/${tokenId}.png`}
                alt={nftData?.name}
                width="75%"
              />
            </Box>
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4} css={textShadowStyle}>{nftData?.name}</Text>
              <Text fontSize="md" mb={4}>{nftData?.description}</Text>
              {nftData?.attributes.map((attribute: NftAttribute, index: number) => (
                <Text key={index} fontSize="3xl" mb={2} css={textShadowStyle}>
                  {attribute.trait_type}: {attribute.value}
                </Text>
              ))}
            </Box>
          </Box>
          <Flex bg="rgba(0, 0, 0, 0.65)" borderRadius="2xl" p={0} mb={0} h="490px" justifyContent="center" alignItems="center">
            <Box
              flex={1}
              p={4}
              m={2}
              borderRadius="2xl"
              boxShadow="md"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <MiniMintPoly />
              <MiniMintBsc />
            </Box>
          </Flex>
        </Box>
      </Box>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default NFTProfilePage;
