import React from 'react';
import {BrowserRouter as Router, Link} from 'react-router-dom';
import AppRoutes from './routes';
import {Col, Row} from "react-bootstrap";

const App = () => {
    return (
        <Router>
            <Row xs="auto" className="mx-5 my-4">
                <Col><Link to={"/"}>Mint</Link></Col>
                <Col><Link to={"/market"}>Market</Link></Col>
                <Col><Link to={"/withdraw"}>Withdraw</Link></Col>
                <Col><Link to={"/royalty"}>WithdrawRoyalty</Link></Col>
            </Row>
            <AppRoutes />
        </Router>
    );
};

export default App;