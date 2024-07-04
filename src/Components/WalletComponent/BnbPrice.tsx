// BnbPrice.tsx
import React, { useEffect } from 'react';
import axios from 'axios';

// Define the props expected by the BnbPrice component
interface BnbPriceProps {
  onPriceFetch: (price: number) => void; // Specify that onPriceFetch is a function taking a number and returning void
}

const BnbPrice: React.FC<BnbPriceProps> = ({ onPriceFetch }) => {
    useEffect(() => {
        const fetchBnbPrice = async () => {
            try {
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
                const price = response.data.binancecoin.usd;
                onPriceFetch(price); // Call the callback with the fetched price
            } catch (error) {
                console.error("Failed to fetch BNB price:", error);
            }
        };

        fetchBnbPrice();
    }, [onPriceFetch]);

    return null; // This component doesn't need to render anything itself
};

export default BnbPrice;
