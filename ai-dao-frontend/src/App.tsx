import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProviderWrapper } from "./components/WalletConnect";

export default function App() {
  return (
    <WalletProviderWrapper>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </WalletProviderWrapper>
  );
}
