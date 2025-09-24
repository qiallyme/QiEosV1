import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard.jsx";

import ClientList from "./ClientList.jsx";

import ClientOnboarding from "./ClientOnboarding.jsx";

import ClientProfile from "./ClientProfile.jsx";

import ProjectWizard from "./ProjectWizard.jsx";

import Projects from "./Projects.jsx";

import Tasks from "./Tasks.jsx";

import TimeTracking from "./TimeTracking.jsx";

import Analytics from "./Analytics.jsx";

import Invoices from "./Invoices.jsx";

import FinancialDashboard from "./FinancialDashboard.jsx";

import Calendar from "./Calendar.jsx";

import FileManager from "./FileManager.jsx";

import CommunicationHub from "./CommunicationHub.jsx";

import Reports from "./Reports.jsx";

import ProjectDetail from "./ProjectDetail.jsx";

import SummaryDashboard from "./SummaryDashboard.jsx";

import AIAssistant from "./AIAssistant.jsx";

import Settings from "./Settings.jsx";

import ClientDashboard from "./ClientDashboard.jsx";

import ClientRequestForm from "./ClientRequestForm.jsx";

import ClientIssues from "./ClientIssues.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ClientList: ClientList,
    
    ClientOnboarding: ClientOnboarding,
    
    ClientProfile: ClientProfile,
    
    ProjectWizard: ProjectWizard,
    
    Projects: Projects,
    
    Tasks: Tasks,
    
    TimeTracking: TimeTracking,
    
    Analytics: Analytics,
    
    Invoices: Invoices,
    
    FinancialDashboard: FinancialDashboard,
    
    Calendar: Calendar,
    
    FileManager: FileManager,
    
    CommunicationHub: CommunicationHub,
    
    Reports: Reports,
    
    ProjectDetail: ProjectDetail,
    
    SummaryDashboard: SummaryDashboard,
    
    AIAssistant: AIAssistant,
    
    Settings: Settings,
    
    ClientDashboard: ClientDashboard,
    
    ClientRequestForm: ClientRequestForm,
    
    ClientIssues: ClientIssues,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ClientList" element={<ClientList />} />
                
                <Route path="/ClientOnboarding" element={<ClientOnboarding />} />
                
                <Route path="/ClientProfile" element={<ClientProfile />} />
                
                <Route path="/ProjectWizard" element={<ProjectWizard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/TimeTracking" element={<TimeTracking />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/FinancialDashboard" element={<FinancialDashboard />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/FileManager" element={<FileManager />} />
                
                <Route path="/CommunicationHub" element={<CommunicationHub />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/SummaryDashboard" element={<SummaryDashboard />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/ClientDashboard" element={<ClientDashboard />} />
                
                <Route path="/ClientRequestForm" element={<ClientRequestForm />} />
                
                <Route path="/ClientIssues" element={<ClientIssues />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}