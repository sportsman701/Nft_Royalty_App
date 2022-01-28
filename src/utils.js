import {ethers} from "ethers";

export function getRoyaltyPtParam(percent){
    return Math.floor(percent * 100);
}

export function getEtherPriceToBN(price){
    return ethers.utils.parseUnits(price.toString());
}

export function getEtherPriceToStr(price){
    return ethers.utils.formatEther(price);
}

export async function getAuth(){
    const [account] = await window.ethereum.request({method: 'eth_requestAccounts'})
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return {account, signer};
}