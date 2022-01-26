import {useEffect, useState} from "react";
import {Container, Row, Col, Spinner, Form, Button} from 'react-bootstrap';
import './App.css';
import alert from "bootstrap/js/src/alert";
import {ethers} from "ethers";

import NftRoyalty from './abis/NftRoyalty.json';
import NftTrader from './abis/NftTrader.json';
import {NFT_ROYALTY_ADDRESS, NFT_TRADER_ADDRESS} from "./const";
import {getEtherPriceToBN, getRoyaltyPtParam} from "./utils";

// SIOs
const charities = [{id: 0, name: 'Bbanga Project1', address: '0x54cfF4e34155d2A1D74c2968ca62F557a1C2B709'}];

// @author Hosokawa-zen
function App() {
    const [cause, setCause] = useState(null);
    const [uri, setURI] = useState('');
    const [price, setPrice] = useState(0);
    const [selfRoyalty, setSelfRoyalty] = useState(0);
    const [selfRoyaltyOption, setSelfRoyaltyOption] = useState(null);
    const [causeRoyalty, setCauseRoyalty] = useState(0);
    const [causeRoyaltyOption, setCauseRoyaltyOption] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Validation
    const isValid = () => {
        if(!uri){
            alert('Please input token uri!');
            return false;
        }
        if(!price){
            alert('Please input token price!');
            return false;
        }
        if(!selfRoyalty){
            alert('Please input your royalty!');
            return false;
        }
        if(!causeRoyalty){
            alert('Please input cause royalty!');
            return false;
        }
        if(!cause){
            alert('Please select cause!');
            return false;
        }
        return true;
    }

    // Mint NFT
    async function onMint() {
        if(isValid()){
            if (typeof window.ethereum !== 'undefined') {
                try{
                    setProcessing(true);
                    const [account] = await window.ethereum.request({method: 'eth_requestAccounts'})
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner()

                    // Get Contract Object
                    const nftContract = new ethers.Contract(NFT_ROYALTY_ADDRESS, NftRoyalty.abi, signer)
                    const traderContract = new ethers.Contract(NFT_TRADER_ADDRESS, NftTrader.abi, signer)

                    // Approve
                    let approved = await nftContract.isApprovedForAll(account, NFT_TRADER_ADDRESS);
                    if(!approved){
                        const transaction = await nftContract.setApprovalForAll(NFT_TRADER_ADDRESS, true);
                        await transaction.await();
                    }

                    // Mint
                    let transaction = await nftContract.mint(account, uri, getRoyaltyPtParam(selfRoyalty), getRoyaltyPtParam(causeRoyalty), cause);
                    const rsx = await transaction.wait();
                    const event = rsx.events.find(e => e.event === 'Transfer');
                    if(event){
                        const {from, to, tokenId} = event.args;
                        console.log('transaction, result', transaction, tokenId);
                        // Set Trade
                        const tradeTransaction = await traderContract.addTrade(getEtherPriceToBN(price), NFT_ROYALTY_ADDRESS, tokenId);
                        await tradeTransaction.wait();

                        console.log("tradeTransaction", tradeTransaction);
                        window.alert("Minted your NFT and added a trade to marketplace");
                    }

                    setProcessing(false);
                } catch (e) {
                    console.log('error', e);
                    setProcessing(false);
                }
            } else {
                alert('Please install metamask');
            }
        }
    }

    return (<div className="App">
        <Container>
            <h1> Orica NFT Mint</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formSaleType">
                    <Form.Label>Sale Type</Form.Label>
                    <Form.Check
                        type={'radio'}
                        name={'saleType'}
                        defaultChecked={true}
                        label={`Fixed Price`}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formURI">
                    <Form.Label>Token URI</Form.Label>
                    <Form.Control type="text" value={uri} placeholder="Enter Token URI" onChange={event => setURI(event.target.value)}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrice">
                    <Form.Label>Price (BNB)</Form.Label>
                    <Form.Control type="number" value={price} placeholder="Enter Price" onChange={event => setPrice(event.target.value)}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCollection">
                    <Form.Label>Choose collection</Form.Label>
                    <Form.Check
                        type={'radio'}
                        name={'collection'}
                        defaultChecked={true}
                        label={`Orica Single`}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSelfRoyalty">
                    <Form.Label>Royalties to you</Form.Label>
                    <Form.Control type="number" value={selfRoyalty} placeholder="Enter Royalties" onChange={event => setSelfRoyalty(event.target.value)}/>
                    {[5, 10, 15].map((value, index) => (
                        <Form.Check
                            key={index}
                            type={'radio'}
                            defaultChecked={value === selfRoyaltyOption}
                            onClick={() => {
                                setSelfRoyalty(value);
                                setSelfRoyaltyOption(value)
                            }}
                            name={'selfRoyaltyOption'}
                            label={`${value}%`}
                        />))}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCauseRoyalty">
                    <Form.Label>Royalties to a good cause</Form.Label>
                    <Form.Control type="number" value={causeRoyalty} placeholder="Enter Royalties" onChange={event => setCauseRoyalty(event.target.value)}/>
                    {[5, 10, 15].map((value, index) => (
                        <Form.Check
                            key={index}
                            type={'radio'}
                            defaultChecked={value === causeRoyaltyOption}
                            onClick={() => {
                                setCauseRoyalty(value);
                                setCauseRoyaltyOption(value)
                            }}
                            name={'causeRoyaltyOption'}
                            label={`${value}%`}
                        />))}
                </Form.Group>

                <Form.Select aria-label="Default select example" onChange={(event) => setCause(event.target.value)}>
                    <option>Select Cause</option>
                    {
                        charities.map((item, index) => (
                            <option key={index} value={item.address} defaultValue={cause === item.address}>{item.name}</option>
                        ))
                    }
                </Form.Select>

                {
                    processing ? <Spinner animation="border" />
                        :
                        <Button variant="primary" type="submit" className="mt-4" onClick={() => onMint()}>
                            Mint
                        </Button>
                }
            </Form>
        </Container>
    </div>);
}

export default App;