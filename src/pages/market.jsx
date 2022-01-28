import {useEffect, useState} from "react";
import {Container, Button, Card, Spinner} from 'react-bootstrap';
import {ethers} from "ethers";
import {getAuth, getEtherPriceToStr, getRoyaltyPtParam} from "../utils";
import {MORALIS_APP_ID, MORALIS_SERVER_URL, NFT_ROYALTY_ADDRESS, NFT_TRADER_ADDRESS, ZERO_ADDRESS} from "../const";
import NftTrader from "../abis/NftTrader.json";
import Moralis from "moralis";

// @author Hosokawa-zen
function Market() {
    const [nfts, setNfts] = useState([]);
    const [isReadyMoralis, setIsReadyMoralis] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        Moralis.start({
            serverUrl: MORALIS_SERVER_URL,
            appId: MORALIS_APP_ID,
        }).then(() => setIsReadyMoralis(true));
    }, []);

    useEffect(() => {
        async function getNFT() {
            try{
                if(!isReadyMoralis){
                    setNfts([]);
                    return;
                }
                const {account, signer} = await getAuth();
                const traderContract = new ethers.Contract(NFT_TRADER_ADDRESS, NftTrader.abi, signer)

                const userNFTs = await Moralis.Web3API.token.getAllTokenIds({
                    address: NFT_ROYALTY_ADDRESS,
                    chain: 'bsc testnet'
                });

                if (userNFTs && userNFTs.result) {
                    const royaltyNfts = [];
                    userNFTs.result.forEach((userNFT) => {
                        if (userNFT.token_address.toLowerCase() === NFT_ROYALTY_ADDRESS.toLowerCase()) {
                            royaltyNfts.push(userNFT);
                        }
                    });

                    const tradeNfts = [];
                    for(let i=0; i<royaltyNfts.length; i++){
                        const trade = await traderContract.trades(NFT_ROYALTY_ADDRESS, royaltyNfts[i].token_id);
                        console.log('trade', trade);
                        if(trade && trade.seller !== ZERO_ADDRESS) {
                            tradeNfts.push({
                                ...royaltyNfts[i],
                                seller: trade.seller,
                                price: trade.price
                            });
                        }
                    }
                    setNfts(tradeNfts);
                    console.log('nfts', royaltyNfts, tradeNfts);
                }
            } catch (e) {
                console.log('error', e);
            }

        }
        getNFT().then();
    }, [isReadyMoralis]);

    const onBuy = async (nft) => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setProcessingId(nft.token_id);
                const {account, signer} = await getAuth();

                const traderContract = new ethers.Contract(NFT_TRADER_ADDRESS, NftTrader.abi, signer);

                // Mint
                let transaction = await traderContract.purchase(nft.token_address, nft.token_id, {value: nft.price});
                await transaction.wait();

                window.alert("You purchased nft!");
                setProcessingId(null);
            } catch (e) {
                console.log('error', e);
                setProcessingId(null);
            }
        }
    }

    return (
        <div className="App">
            <Container>
                <h1>NFT MarketPlace</h1>
                {
                    !isReadyMoralis && <Spinner animation="border"/>
                }
                {
                 nfts.map(nft =>
                (<Card key={nft.token_id} style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Title>Owner: {nft.seller}</Card.Title>
                        <Card.Text>
                            URI : <Card.Link to={nft.token_uri}>{nft.token_uri}</Card.Link>
                        </Card.Text>
                        <Card.Text>
                            TOKEN NAME : {nft.name}  TOKEN SYMBOL: {nft.symbol}
                        </Card.Text>
                        <Card.Text>
                            TOKEN ID : {nft.token_id}
                        </Card.Text>
                        <Card.Text>
                            Price : {getEtherPriceToStr(nft.price)} BNB
                        </Card.Text>
                        {
                            processingId === nft.token_id ?
                                <Spinner animation="border" />
                                :
                            <Button variant="primary" onClick={() => onBuy(nft)}>Buy</Button>
                        }
                    </Card.Body>
                </Card>))
                }
            </Container>
        </div>
    )
}

export default Market;