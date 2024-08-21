import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Footer from './Components/Footer/Footer';
import ViewBsc from './Components/MintBsc/ViewCollectionBSC';
import ViewPoly from './Components/MintPoly/ViewCollectionPOLY';
import ViewPolyV2 from './Components/MintPolyV2/ViewCollectionPOLY';
import ClaimPirateV2 from './Components/MintPolyV2/ClaimRewardsComponent/ClaimRewards';


const flash = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const imagePaths = [
  '/images/robbers/1.jpeg',
  '/images/robbers/2.jpeg',
  '/images/robbers/3.jpeg',
  '/images/robbers/4.jpeg',
  '/images/robbers/5.jpeg',
  '/images/robbers/6.jpeg',
  '/images/robbers/7.jpeg',
  '/images/robbers/8.jpeg',
  '/images/robbers/9.jpeg',
  '/images/robbers/10.jpeg',
  '/images/robbers/11.jpeg',
  '/images/robbers/12.jpeg',
];

const imagePathsPirates = [
  '/images/pirates/256.png',
  '/images/pirates/257.png',
  '/images/pirates/258.png',
  '/images/pirates/259.png',
  '/images/pirates/260.png',
  '/images/pirates/261.png',
  '/images/pirates/262.png',
  '/images/pirates/263.png',
  '/images/pirates/264.png',
  '/images/pirates/265.png',
  '/images/pirates/266.png',
  '/images/pirates/267.png',
];


const imagePathsPiratesV2 = [
  '/images/v2pirates/256.png',
  '/images/v2pirates/257.png',
  '/images/v2pirates/258.png',
  '/images/v2pirates/259.png',
  '/images/v2pirates/260.png',
  '/images/v2pirates/261.png',
  '/images/v2pirates/262.png',
  '/images/v2pirates/263.png',
  '/images/v2pirates/264.png',
  '/images/v2pirates/265.png',
  '/images/v2pirates/266.png',
  '/images/v2pirates/267.png',
];

const NewPage = () => {
  const [currentImage, setCurrentImage] = useState<string>(imagePaths[0]);
  const [currentImagePirate, setCurrentImagePirate] = useState<string>(imagePathsPirates[0]);
  const [currentImagePirateV2, setCurrentImagePirateV2] = useState<string>(imagePathsPiratesV2[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImage(imagePaths[Math.floor(Math.random() * imagePaths.length)]);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalIdPirate = setInterval(() => {
      setCurrentImagePirate(imagePathsPirates[Math.floor(Math.random() * imagePathsPirates.length)]);
    }, 2000);

    return () => clearInterval(intervalIdPirate);
  }, []);

    useEffect(() => {
      const intervalIdPirateV2 = setInterval(() => {
        setCurrentImagePirateV2(imagePathsPiratesV2[Math.floor(Math.random() * imagePathsPiratesV2.length)]);
      }, 2000);

      return () => clearInterval(intervalIdPirateV2);
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
                        <Image p={2} ml="4" src="/images/mainlogovert.png" alt="Heading" width="80px" />
                      </Link>
                      <Flex   align="right">

                      <w3m-button />
                    </Flex>
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
          <Flex
  flex={1}
  mt={2}
  p={4}
  borderRadius="2xl"
  textAlign="center"
  bg="rgba(0, 0, 0, 0.61)"
  flexWrap="wrap"
  alignItems="center"
  justifyContent="space-between" // Use this to space items correctly
  h="100px" // Adjust height as needed to see the centering effect
>
  <Text mb={2} ml={4} textAlign="left" fontSize="lg" fontWeight="bolder">
    Welcome to Cosmic Rich Pigz NFT's!  Choose one of our Live "Pigz" collections below and start minting.
  </Text>

  <w3m-network-button  />
</Flex>



      <ClaimPirateV2 />



            <Flex justifyContent="center" p={0} flexWrap="wrap" position="relative">
            <Box
              flex={1}
              minW="300px"
              m={2}
              p={7}
              borderRadius="2xl"
              boxShadow="md"
              textAlign="center"
              bg="rgba(55, 5, 76, 0.61)"
              border="2px"
              borderColor="#7140d7"
            >
              <Link to="/mintpolyV2">
              <Text
        textAlign="center"
        color="white"
        fontSize="4xl"
        fontWeight="bolder"
        animation={`${flash} 2s infinite`}
        >
        V2 Minting Live!
        </Text>
                <Image src="/images/piratepigztextlogoV2.png" alt="header" mx="auto" width="40%" minW="250px" mt="28px" />

                  <Text textAlign="center" fontSize="lg" fontWeight="normal">
                      On
                  </Text>

                <Image src="/images/polygon.png" alt="header" mx="auto" width="20%" minW="180px"  mb={2} />
                  <Flex justifyContent="center" flexWrap="wrap">
                    <Text mt="10px" width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                      Click to Enter
                    </Text>
                  </Flex>

                  <Flex justifyContent="center" flexWrap="wrap">
                  <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                    Pirate Pigz V2 Minting
                  </Text>
                </Flex>
                <Image src={currentImagePirateV2} alt="Pirate Pigz" mx="auto" width="40%" minW="250px" mt="28px" borderRadius="2xl" />
              </Link>
            </Box>
{/*///////////////////////////////*/}


              <Box

                border="1px"
                borderColor="#fff"
                flex={1}
                minW="300px"
                m={2}
                p={7}
                borderRadius="2xl"
                boxShadow="md"
                textAlign="center"
                bg="rgba(0, 0, 0, 0.61)"
              >
                <Link to="/mintpoly">

                <Text
              textAlign="center"
              color="orange"
              fontSize="4xl"
              fontWeight="bolder"
              animation={`${flash} 2s infinite`}
              >
              V1 Minting Completed!
              </Text>



                  <Image src="/images/piratepigztextlogo.png" alt="header" mx="auto" width="40%" minW="250px" mt="28px" />



                                  <Text textAlign="center" fontSize="lg" fontWeight="normal">
                                      On
                                  </Text>


                  <Image src="/images/polygon.png" alt="header" mx="auto" width="20%" minW="180px"  mb={2} />
                    <Flex justifyContent="center" flexWrap="wrap">
                      <Text mt="10px" width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                        Click to View
                      </Text>
                    </Flex>

                    <Flex justifyContent="center" flexWrap="wrap">
                    <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                      Pirate Pigz V1 Collection
                    </Text>
                  </Flex>
                  <Image src={currentImagePirate} alt="Pirate Pigz" mx="auto" width="40%" minW="250px" mt="28px" borderRadius="2xl" />
                </Link>
              </Box>




                            <Box

                            border="2px"
                            borderColor="#d19a19"
                              flex={1}
                              minW="300px"
                              m={2}
                              p={7}
                              borderRadius="2xl"
                              boxShadow="md"
                              textAlign="center"
                              bg="rgba(121, 88, 45, 0.61)"
                            >
                              <Link to="/mintbsc">
                              <Text
                        textAlign="center"
                        color="white"
                        fontSize="4xl"
                        fontWeight="bolder"
                        animation={`${flash} 2s infinite`}
                        >
                        BSC Minting Live!
                        </Text>
                                  <Image src="/images/pigzrobberstextlogo.png" alt="header" mx="auto" width="40%" minW="250px" mt="28px" />

                                    <Text textAlign="center" fontSize="lg" fontWeight="normal">
                                        On
                                    </Text>

                                  <Image src="/images/binance.png" alt="header" mx="auto" width="20%" minW="180px"  mb={2}  />

                                <Flex justifyContent="center" flexWrap="wrap">
                                  <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                                    Click to Enter
                                  </Text>
                                </Flex>

                              <Flex justifyContent="center" flexWrap="wrap">
                                <Text width="60%" textAlign="center" fontSize="lg" fontWeight="normal">
                                  Pigz and Robbers Minting
                                </Text>
                              </Flex>
                                <Image src={currentImage} alt="Pigz and Robbers" mx="auto" width="40%" minW="250px" mt="28px" borderRadius="2xl" />
                              </Link>
                            </Box>

            </Flex>
            <Box
              flex={1}
              m={2}
              p={4}
              bg="rgba(0, 0, 0, 0.61)"
              borderRadius="md"
              boxShadow="md"
              textAlign="center"
            >
            <ViewPolyV2 />
              <ViewBsc />
              <ViewPoly />
              <Text mb="200px" fontSize="xl">
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />





    </>
  );
};

export default NewPage;
