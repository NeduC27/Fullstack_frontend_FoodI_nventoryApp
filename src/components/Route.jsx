import { Routes, Route } from 'react-router-dom';
import BuyerPanel from './BuyerPanel';
import BuyerPanelLandingPage from './BuyerPanelLandingPage';

const categoryRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<BuyerPanelLandingPage />} />
            <Route path="/buyer-panel" element={<BuyerPanel />} />
        </Routes>
    )
}
