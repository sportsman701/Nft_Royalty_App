import {ethers} from "ethers";

export function getRoyaltyPtParam(percent){
    return Math.floor(percent * 100);
}

export function getEtherPriceToBN(price){
    return ethers.utils.parseUnits(price.toString());
}