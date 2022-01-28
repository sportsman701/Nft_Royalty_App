import React from 'react';
import {Routes, Route, Link} from 'react-router-dom';

import Home from './pages/home';
import Market from "./pages/market";
import Withdraw from "./pages/withdraw";
import WithdrawRoyalty from "./pages/withdrawRoyalty";

const AppRoutes = () => (
    <Routes>
        <Route exact path="/market" element={<Market/>}/>
        <Route exact path="/withdraw" element={<Withdraw/>}/>
        <Route exact path="/royalty" element={<WithdrawRoyalty/>}/>
        <Route path="/" element={<Home/>}/>
    </Routes>
);

export default AppRoutes;
