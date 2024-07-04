// tokens.ts
export interface Token {
  name: string;
  symbol: string;
  address: string;
  icon: string;
  website: string;
  telegram: string;
  chart: string;
}
export const defaultTokenIcon = 'images/7878_hmm.png';

const tokens: Token[] = [
    {
      name: 'Alpha7 Token',
      symbol: 'ALPHA7',
      address: '0x88CE0d545cF2eE28d622535724B4A06E59a766F0',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/Alpha7token.png',
      website: 'https://alpha7.live',
      telegram: 'https://t.me/system7_token',
      chart: 'https://dexscreener.com/bsc/0xa2136fea6086f2254c9361c2c3e28c00f9e73366',
    },
    {
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      icon: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'USDT Stable Coin',
      symbol: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      icon: 'https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'USDC Stable Coin',
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      icon: 'https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'BUSD Stable Coin',
      symbol: 'BUSD',
      address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      icon: 'https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'Bitcoin BSC',
      symbol: 'BTCB',
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      icon: 'https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'Ethereum',
      symbol: 'WETH',
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      icon: 'https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'Ripple XRP',
      symbol: 'XRP',
      address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
      icon: 'https://tokens.pancakeswap.finance/images/0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE.png',
      website: '',
      telegram: '',
      chart: '',
    },
    {
      name: 'DragonBallZ BSC Token',
      symbol: 'DBZ',
      address: '0x3c4E316A3F9443eEb2c52aeEa253D84783fA609a',
      icon: 'https://dragonballzbsc.com/wp-content/uploads/2024/05/DBZ-LOGO-CLEAR-5k-237x300.png',
      website: 'https://dragonballzbsc.com/',
      telegram: 'https://t.me/DBZENTRYPORTAL',
      chart: 'https://dexscreener.com/bsc/0xfd6298ae019363c9f4f17de1d6734d16ab5bf6f6',
    },
    {
      name: 'High Score BSC Token',
      symbol: 'HSC',
      address: '0xe9e3180BC8d92cc7F37487DA9d55e262E18C6b3B',
      icon: 'https://highscorebsc.com/wp-content/uploads/2023/12/cropped-cropped-high-score-3.0-300x300.png',
      website: 'https://highscorebsc.online/',
      telegram: 'https://t.me/highscorebsc',
      chart: 'https://dexscreener.com/bsc/0x1b788a323a7a99d1f9ab32993b3a355f2a791c2b',
    },
    {
      name: 'Toast Token',
      symbol: 'TOASTY',
      address: '0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/toast.png',
      website: 'https://toastecosystem.online/',
      telegram: 'https://t.me/+EcHpneQgjthkMDRk',
      chart: 'https://dexscreener.com/bsc/0x48087ac66e205063fb3462f873e19e802e184992',
    },
    {
      name: 'Stag Token',
      symbol: 'STAG',
      address: '0xa94D583e4Ea69216b870A6300a9f717bB6D4a076',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/stag.png',
      website: 'https://stagtoken.com/',
      telegram: 'https://t.me/StagToken',
      chart: 'https://dexscreener.com/bsc/0x3b5e72532aa5e905a0501b1d027849c980008f49',
    },
    {
      name: 'Play World Token',
      symbol: 'PLYWLD',
      address: '0x74c3D5c3a5F5D08919147D4998c259C0585eBab9',
      icon: 'https://static.wixstatic.com/media/5a75c0_211f7d32c68147a38f28edb340e127e0~mv2.png/v1/fill/w_458,h_492,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2023-08-02%2017_02_edited.png',
      website: 'https://www.yourplayworld.com/',
      telegram: 'https://t.me/YOURPLAYWORLD',
      chart: 'https://dexscreener.com/bsc/0x5127b5344e69fbedd25af98f2fd6ffda2ab9c49a',
    },
    {
      name: 'BUYBACK',
      symbol: 'BB',
      address: '0x4d51f5856D9C97aff217fa08bb46e460d948E4a0',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/bb.png',
      website: '',
      telegram: 'https://t.me/BUYBACKOFFICIAL',
      chart: 'https://dexscreener.com/bsc/0x957395b68A50ab94e0ac384f83D5b6Ba1e1C750a',
    },


    {
      name: 'Baby Doge Coin',
      symbol: 'BabyDoge',
      address: '0xc748673057861a797275CD8A068AbB95A902e8de',
      icon: 'https://bscscan.com/token/images/babydoge_32.png',
      website: '',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0xc736ca3d9b1e90af4230bd8f9626528b3d4e0ee0',
    },
    {
      name: 'Yeti Token',
      symbol: 'YETI',
      address: '0xA2936abe3341B326f8F9BafFBd9988B2b7384229',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/yeti.png',
      website: 'https://yeti-token.com/',
      telegram: 'https://t.me/Yetiverify',
      chart: 'https://dexscreener.com/bsc/0x7af697076454fc4f04bdce15a7529aebb9d90352',
    },
    {
      name: 'SEXY 69',
      symbol: '$ASS',
      address: '0xC6Fd62E32ed015526bb1D871e338cA5F93037A4b',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/ass.png',
      website: '',
      telegram: 'https://t.me/Sexy69Bsc',
      chart: 'https://dexscreener.com/bsc/0x06C2D0Dd79D39DE7B8cF3Bd5Da3f50521A804eb8',
    },
    {
      name: 'Creed One',
      symbol: 'CR1',
      address: '0x74A740257DaC46f1c378eb81Fc2A86F4aaf2b3B1',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/cr1.png',
      website: 'https://Creed-one.com',
      telegram: 'https://t.me/cr1token',
      chart: 'https://dexscreener.com/bsc/0x2f854642fe3d57fddbe45a96b86669dfdd778f90',
    },
    {
      name: 'The Man Token',
      symbol: 'TMT',
      address: '0x689cc7bb716aff448dca16a8b61253c7e246d9fc',
      icon: 'https://raw.githubusercontent.com/ArielRin/TheManToken-public/master/Codebase%20for%20dapp/images/page/man.png',
      website: 'https://themantoken.com/',
      telegram: 'https://t.me/the_man_token/1',
      chart: 'https://dexscreener.com/bsc/0x511f4f91b5147243088bb07e1f192f160f009e82',
    },
    {
      name: 'Pangea Rewards Token',
      symbol: 'PRT',
      address: '0xd8B9E0993fce7d05b3F11D828Cf52D17637142Ca',
      icon: 'https://raw.githubusercontent.com/ArielRin/PangeaPage-Update/master/Images/pangearnd.png',
      website: 'https://pangearewardstoken.com/',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0xad80fdc107d983cd76bec153abc00ff00e3477de',
    },
    {
      name: 'Baby Creed',
      symbol: 'BCR',
      address: '0xF23075cE91A3AC25F70d6c6713c8975BdD65171f',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RewardsDistributorBnb/bcr.png',
      website: 'https://Creed-one.com',
      telegram: 'https://t.me/cr1token',
      chart: 'https://dexscreener.com/bsc/0xe0817cafbc40f8b9d2860383573948bb5c80ecf7',
    },
    {
      name: 'ReflectR',
      symbol: 'RTR',
      address: '0x5097FccD1E58fC18717c6bFc8Ca0E6dc0e006758',
      icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/rtr.png',
      website: 'http://www.reflectr.info/',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0xf60D2Fec6E45DaB7eBfec0839640d9338761eca9',
    },


    {
      name: 'RocketFi',
      symbol: 'ROCKETFI',
      address: '0x6e61579c22f9a6da63a33e819f29b6697d2a126e',
      icon: 'https://www.rocketfi.app/static/media/rocketfi_yellow_token.2d00ed41084bdc2c845d.png',
      website: 'https://www.rocketfi.app/',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0xca8cb86eb92a6b83be9a8d8872e4ea52bc968a33',
    },
    {
      name: 'Affinity',
      symbol: 'AFNTY',
      address: '0xF59918B07278ff20109f8c37d7255e0677B45c43',
      icon: 'https://affinitybsc.com/images/325x280xaffinitylogo.png.pagespeed.ic.mFNtLtsWGW.png',
      website: 'https://affinitybsc.com/affinity-token.html',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0x8ac454a7a92e5362cc817177d80aad284012cf19',
    },
    {
      name: 'OPHX',
      symbol: 'OPHX',
      address: '0x59803e5Fe213D4B22fb9b061c4C89E716a1CA760',
      icon: 'https://assets.coingecko.com/coins/images/35122/thumb/OPHX_200.png?1707411414',
      website: '',
      telegram: '',
      chart: 'https://dexscreener.com/bsc/0x0fce2c9c5f87b767adb37a939550a600fa4d1a2a',
    },

  // Add more tokens as needed 0x59803e5Fe213D4B22fb9b061c4C89E716a1CA760
];

export default tokens;


//
// {
//   name: 'MyRentsDue Token',
//   symbol: 'RENTSDUE',
//   address: '0x70159615c167F94F6122A2f3668Df1DAD8301a5b',
//   icon: 'https://raw.githubusercontent.com/ArielRin/Alpha7-Public-Files-and-Assets/master/OldDapp/src/Pages/RentsDueRewardsDistributor/rentsdue.png',
//   website: 'https://t.me/+l5xfsk3ZBj5hYzBl'
// },
