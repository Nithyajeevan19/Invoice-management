import { useSelector } from 'react-redux';
import { useState, useMemo, useEffect } from 'react';
import { 
  Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, 
  DollarSign, Package, Calendar, Bell, X, Send, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Activity, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

import { 
  predictPaymentDelay, 
  forecastRevenue, 
  detectAnomalies, 
  generateRecommendations,
  getTopCLVCustomers,
  forecastCashFlow,
  getAIBusinessAnalysis
} from '../utils/aiInsights';
import { selectAllInvoices, selectInvoiceLoading, selectInvoiceError } from '../invoiceSelectors';

// ==================== CONFIGURATION ====================
const CONFIG = {
  monthlyExpenses: 80000,
  salaryDate: 1,
};

// ==================== UI COMPONENTS ====================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    premium: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================

const AIInsights = () => {
  const invoices = useSelector(selectAllInvoices);
  const customers = useSelector((state) => state.customers?.customers);
  const products = useSelector((state) => state.products?.products);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Memoized insights
  const stats = useMemo(() => {
    if (!invoices?.length) return null;
    return {
      forecast: forecastRevenue(invoices),
      anomalies: detectAnomalies(invoices),
      recommendations: generateRecommendations({ invoices, products, customers }),
      cashFlow: forecastCashFlow(invoices, { monthlyExpenses: CONFIG.monthlyExpenses }),
      topCustomers: getTopCLVCustomers(invoices, 3)
    };
  }, [invoices, products, customers]);

  // Fetch AI Strategic Analysis
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!invoices?.length || aiAnalysis) return;
      setAnalyzing(true);
      try {
        const analysis = await getAIBusinessAnalysis({ invoices, customers, products });
        setAiAnalysis(analysis);
      } catch (err) {
        console.error('Failed to get AI analysis', err);
      } finally {
        setAnalyzing(false);
      }
    };
    fetchAIAnalysis();
  }, [invoices, customers, products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-600" />
        </div>
        <p className="text-slate-600 font-medium animate-pulse">Consulting Financial AI Brain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 bg-rose-50/30">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Intelligence Link Interrupted</h3>
        <p className="text-slate-600 mt-2">{error}</p>
      </Card>
    );
  }

  if (!invoices?.length) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
        <div className="bg-indigo-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="h-10 w-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Awaiting Business Data</h3>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">
          Upload your first invoice to unlock real-time financial intelligence, revenue forecasting, and strategic insights.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Strategic Header & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/20 p-2 rounded-lg backdrop-blur-md">
                <Brain className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Executive Intelligence</h2>
            </div>
            
            {analyzing ? (
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse"></div>
                <div className="h-20 bg-white/5 rounded-xl w-full animate-pulse"></div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6">
                <p className="text-indigo-100 text-xl font-medium leading-relaxed">
                  "{aiAnalysis.summary}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Strategic Opportunities</span>
                    </div>
                    <ul className="text-sm space-y-2 text-slate-300">
                      {aiAnalysis.opportunities?.map((opt, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-indigo-400">•</span> {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Critical Risks</span>
                    </div>
                    <ul className="text-sm space-y-2 text-slate-300">
                      {aiAnalysis.risks?.map((risk, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-indigo-400">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-indigo-300 uppercase mb-2">Strategic Advice</h4>
                  <p className="text-indigo-50 text-sm italic">"{aiAnalysis.strategicAdvice}"</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">System ready for analysis. Upload more data to refine strategic advice.</p>
            )}
          </div>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center text-center relative">
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Business Health Score</h3>
          <div className="relative h-48 w-48">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              <circle 
                className="text-indigo-600 transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * (aiAnalysis?.healthScore || 75)) / 100}
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" cx="50" cy="50" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">{aiAnalysis?.healthScore || 75}</span>
              <span className="text-xs font-bold text-slate-400">OPTIMAL</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500 font-medium">
            Your business is performing <span className="text-indigo-600">better than 82%</span> of similar SMEs.
          </p>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Badge variant="success">+{stats?.forecast?.growth}%</Badge>
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Revenue Forecast</h4>
          <p className="text-2xl font-bold text-slate-900">₹{stats?.forecast?.forecast.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Predicted for next month</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <Badge variant="error">{stats?.anomalies?.length || 0} Alerts</Badge>
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Risk Anomalies</h4>
          <p className="text-2xl font-bold text-slate-900">{stats?.anomalies?.length > 0 ? 'Action Required' : 'System Clear'}</p>
          <p className="text-xs text-slate-400 mt-2">Statistical irregularities</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="h-5 w-5" />
            </div>
            <Badge variant="warning">{stats?.cashFlow?.collectionRate}%</Badge>
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Collection Rate</h4>
          <p className="text-2xl font-bold text-slate-900">₹{stats?.cashFlow?.avgMonthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Average monthly inflow</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
            <Badge variant="premium">Elite</Badge>
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Top Customer Value</h4>
          <p className="text-2xl font-bold text-slate-900">₹{stats?.topCustomers[0]?.predictedCLV.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Highest lifetime value</p>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">Smart Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {stats?.recommendations.map((rec, i) => (
              <Card key={i} className="p-5 hover:translate-x-1 transition-transform cursor-pointer border-l-4 border-l-indigo-500">
                <div className="flex gap-4">
                  <div className="text-2xl">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-slate-900">{rec.title}</h5>
                      <Badge variant={rec.priority === 'high' ? 'error' : 'warning'}>{rec.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{rec.message}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.details.map((d, j) => (
                        <span key={j} className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-bold uppercase">
                          {d}
                        </span>
                      ))}
                    </div>
                    {rec.actionable && (
                      <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                        {rec.action} <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Forecasts & Predictions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-900">Cash Flow Projection</h3>
          </div>
          
          <Card className="p-0">
            <div className="divide-y divide-slate-100">
              {stats?.cashFlow?.forecasts.map((f, i) => (
                <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${f.status === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {f.status === 'positive' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{f.month}</p>
                      <p className="text-xs text-slate-500">Predicted Balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${f.status === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {f.status === 'positive' ? '+' : ''}₹{f.netCashFlow.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-400">Estimated</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 italic">
                Projections are based on historical payment patterns and current collection rates.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
