import React, { useState, useEffect } from 'react';
import { getAnalytics, getResponses } from '../backend/responses.jsw';
import { exportToCSV } from '../backend/export.jsw';
import { getPlan, hasFeature, getUpgradeRecommendations } from '../backend/plan.jsw';
import ChartContainer from './components/ChartContainer';
import FilterPanel from './components/FilterPanel';
import ExportPanel from './components/ExportPanel';
import SettingsPanel from './components/SettingsPanel';
import './Dashboard.css';

/**
 * Main Dashboard Page for Post-Purchase Survey Analytics
 */
const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [filters, setFilters] = useState({
    dateFrom: getDefaultDateFrom(),
    dateTo: new Date().toISOString().split('T')[0],
    channel: '',
    dateRange: '30days'
  });
  const [currentPlan, setCurrentPlan] = useState(null);
  const [upgradeRecommendations, setUpgradeRecommendations] = useState([]);

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadAnalyticsData();
    }
  }, [filters]);

  /**
   * Initialize dashboard data
   */
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Load plan information
      const plan = await getPlan();
      setCurrentPlan(plan);
      
      // Load initial analytics data
      await loadAnalyticsData();
      
      // Load upgrade recommendations
      const usage = await calculateUsage();
      const recommendations = await getUpgradeRecommendations(usage);
      setUpgradeRecommendations(recommendations.recommendations || []);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load analytics data with current filters
   */
  const loadAnalyticsData = async () => {
    try {
      const analyticsResult = await getAnalytics(filters);
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      } else {
        throw new Error(analyticsResult.error);
      }
      
      // Also load raw responses for detailed view
      const responsesResult = await getResponses({
        ...filters,
        limit: 100
      });
      
      if (responsesResult.success) {
        setResponses(responsesResult.data);
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    }
  };

  /**
   * Calculate current usage statistics
   */
  const calculateUsage = async () => {
    try {
      const monthlyFilters = {
        dateFrom: getMonthStart().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      };
      
      const monthlyResponses = await getResponses(monthlyFilters);
      
      return {
        monthlyResponses: monthlyResponses.success ? monthlyResponses.data.length : 0,
        needsServerEvents: false, // This would be determined by user settings
        multipleProducts: false   // This would be determined by analyzing responses
      };
    } catch (error) {
      console.error('Error calculating usage:', error);
      return {};
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  /**
   * Handle CSV export
   */
  const handleExport = async () => {
    try {
      const exportResult = await exportToCSV(filters);
      
      if (exportResult.success) {
        // Create and download file
        const blob = new Blob([exportResult.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportResult.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(exportResult.error);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  /**
   * Get default "from" date (30 days ago)
   */
  function getDefaultDateFrom() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get start of current month
   */
  function getMonthStart() {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (loading) {
    return (
      <div className="pps-dashboard">
        <div className="pps-loading-container">
          <div className="pps-loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pps-dashboard">
      <header className="pps-dashboard-header">
        <div className="pps-header-content">
          <h1>Post-Purchase Survey Analytics</h1>
          <div className="pps-header-actions">
            <button
              className="pps-export-button"
              onClick={handleExport}
              title="Export data to CSV"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        {currentPlan && (
          <div className="pps-plan-indicator">
            <span className={`pps-plan-badge pps-plan-${currentPlan.planId}`}>
              {currentPlan.name} Plan
            </span>
            {currentPlan.planId === 'free' && (
              <span className="pps-plan-limit">
                {analytics?.totals?.responses || 0}/100 responses this month
              </span>
            )}
          </div>
        )}
      </header>

      {upgradeRecommendations.length > 0 && (
        <div className="pps-upgrade-banner">
          <div className="pps-upgrade-content">
            <h3>💡 Upgrade Recommendations</h3>
            {upgradeRecommendations.map((rec, index) => (
              <div key={index} className="pps-upgrade-item">
                <strong>{rec.reason}:</strong> {rec.benefit}
                <button className="pps-upgrade-cta">
                  Upgrade to {rec.target}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="pps-error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="pps-error-close">×</button>
        </div>
      )}

      <nav className="pps-dashboard-nav">
        <button
          className={`pps-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`pps-nav-tab ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Raw Data
        </button>
        <button
          className={`pps-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main className="pps-dashboard-main">
        <aside className="pps-sidebar">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            responses={responses}
          />
        </aside>

        <div className="pps-content">
          {activeTab === 'analytics' && (
            <div className="pps-analytics-view">
              <div className="pps-stats-summary">
                <div className="pps-stat-card">
                  <h3>Total Responses</h3>
                  <div className="pps-stat-value">
                    {analytics?.totals?.responses || 0}
                  </div>
                </div>
                <div className="pps-stat-card">
                  <h3>Total Revenue</h3>
                  <div className="pps-stat-value">
                    ${analytics?.totals?.revenue || '0.00'}
                  </div>
                </div>
                <div className="pps-stat-card">
                  <h3>Avg Order Value</h3>
                  <div className="pps-stat-value">
                    ${analytics?.totals?.averageOrderValue || '0.00'}
                  </div>
                </div>
              </div>

              <div className="pps-charts-container">
                <ChartContainer analytics={analytics} />
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="pps-responses-view">
              <div className="pps-responses-header">
                <h2>Response Data</h2>
                <ExportPanel onExport={handleExport} />
              </div>
              <div className="pps-responses-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order ID</th>
                      <th>Channel</th>
                      <th>Value</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map(response => (
                      <tr key={response.id}>
                        <td>{new Date(response.createdAt).toLocaleDateString()}</td>
                        <td>{response.orderId}</td>
                        <td>
                          <span className="pps-channel-badge">
                            {response.channel}
                          </span>
                        </td>
                        <td>${response.orderValue || '0.00'}</td>
                        <td>
                          {response.otherText && (
                            <span className="pps-other-text" title={response.otherText}>
                              "{response.otherText.substring(0, 30)}..."
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {responses.length === 0 && (
                  <div className="pps-no-data">
                    No responses found for the selected filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsPanel currentPlan={currentPlan} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;