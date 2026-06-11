import React, { useState } from 'react';
import axios from 'axios';
import { Settings, ShieldAlert, Navigation, Truck, Map as MapIcon, ArrowRight, Play } from 'lucide-react';

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://localhost:8000';

export const LogisticsPipeline: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  
  // Phase 1 State
  const [p1Input, setP1Input] = useState({ foodType: 'Cooked Rice', preparedHoursAgo: 4, temperature: 28, storageCondition: 'Open', packaged: false });
  const [p1Result, setP1Result] = useState<any>(null);

  // Phase 2 State
  const [p2Input, setP2Input] = useState({ distanceKm: 15, quantityMeals: 100, ngoUrgency: 8 });
  const [p2Result, setP2Result] = useState<any>(null);

  // Phase 3 State
  const [p3Result, setP3Result] = useState<any>(null);

  // Phase 4 State
  const [p4Result, setP4Result] = useState<any>(null);

  // Phase 5 State
  const [p5Result, setP5Result] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const runPhase1 = async () => {
    setLoading(true);
    setActivePhase(1);
    try {
      const res = await axios.post(`${ML_API_URL}/predict-spoilage`, p1Input);
      setP1Result(res.data);
    } catch (e) {
      console.error(e);
      alert("Error reaching ML Service");
    }
    setLoading(false);
  };

  const runPhase2 = async () => {
    if (!p1Result) return alert('Run Phase 1 first!');
    setLoading(true);
    setActivePhase(2);
    try {
      const res = await axios.post(`${ML_API_URL}/calculate-priority`, {
        foodType: p1Input.foodType,
        safeHoursRemaining: p1Result.safeHoursRemaining,
        distanceToNGO: p2Input.distanceKm,
        ngoUrgency: p2Input.ngoUrgency,
        foodQuantityKg: p2Input.quantityMeals * 0.2
      });
      setP2Result(res.data);
    } catch (e) {
      console.error(e);
      alert('Error reaching ML Service (Phase 2)');
    }
    setLoading(false);
  };

  const runPhase3 = async () => {
    if (!p2Result) return alert('Run Phase 2 first!');
    setLoading(true);
    setActivePhase(3);
    try {
      const payload = {
        donor: {
          name: 'Demo Donor',
          latitude: 19.0760,
          longitude: 72.8777,
          foodType: p1Input.foodType,
          quantityKg: p2Input.quantityMeals * 0.2
        },
        ngos: [
          { name: 'Hope Shelter', latitude: 19.0850, longitude: 72.8800, urgencyLevel: 9, acceptedFoods: ['Cooked Rice', 'Bread'] },
          { name: 'GreenPlate', latitude: 19.1000, longitude: 72.9000, urgencyLevel: 5, acceptedFoods: ['Cooked Rice', 'Packed Food'] }
        ]
      };
      const res = await axios.post(`${ML_API_URL}/match-ngo`, payload);
      setP3Result(res.data);
    } catch (e) {
      console.error(e);
      alert('Error reaching ML Service (Phase 3)');
    }
    setLoading(false);
  };

  const runPhase4 = async () => {
    if (!p3Result) return alert('Run Phase 3 first!');
    setLoading(true);
    setActivePhase(4);
    try {
      const payload = {
        trucks: [
          { truckId: 'TRUCK-1', currentLatitude: 19.0500, currentLongitude: 72.8500, capacityKg: 500, available: true }
        ],
        donations: [
          {
            id: 101,
            donorName: 'Demo Donor',
            latitude: 19.0760,
            longitude: 72.8777,
            quantityKg: p2Input.quantityMeals * 0.2,
            priorityScore: p2Result.priorityScore,
            safeHoursRemaining: p1Result.safeHoursRemaining
          }
        ],
        ngo: { name: p3Result.bestMatch.ngoName, latitude: 19.0850, longitude: 72.8800 }
      };
      const res = await axios.post(`${ML_API_URL}/assign-truck`, payload);
      setP4Result(res.data);
    } catch (e) {
      console.error(e);
      alert('Error reaching ML Service (Phase 4)');
    }
    setLoading(false);
  };

  const runPhase5 = async () => {
    if (!p4Result) return alert('Run Phase 4 first!');
    setLoading(true);
    setActivePhase(5);
    try {
      const payload = {
        truck: { truckId: p4Result.assignedTruck, currentLatitude: 19.0500, currentLongitude: 72.8500, capacityKg: 500 },
        donations: [
          {
            donationId: 101,
            donorName: 'Demo Donor',
            latitude: 19.0760,
            longitude: 72.8777,
            priorityScore: p2Result.priorityScore,
            safeHoursRemaining: p1Result.safeHoursRemaining,
            quantityKg: p2Input.quantityMeals * 0.2
          }
        ],
        ngo: { ngoName: p3Result.bestMatch.ngoName, latitude: 19.0850, longitude: 72.8800 }
      };
      const res = await axios.post(`${ML_API_URL}/optimize-live-route`, payload);
      setP5Result(res.data);
    } catch (e) {
      console.error(e);
      alert('Error reaching ML Service (Phase 5)');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Zero Hunger AI Operations
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0.5rem auto' }}>
          Experience the real-time FoodRescue machine learning pipeline. Watch how our AI orchestrates the entire lifecycle of a donation to ensure zero waste.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* PHASE 1 */}
        <div className={`glass-panel ${activePhase === 1 ? 'border-primary' : ''}`} style={{ transition: 'all 0.3s', border: activePhase === 1 ? '1px solid #10b981' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings color="#10b981" /> Phase 1: Spoilage Engine</h3>
            <button className="btn btn-primary" onClick={runPhase1} disabled={loading} style={{ padding: '0.5rem 1rem' }}><Play size={16} /> Run Engine</button>
          </div>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div>
              <label className="form-label">Food Type</label>
              <input className="form-input" value={p1Input.foodType} onChange={e => setP1Input({...p1Input, foodType: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Temp (°C)</label>
              <input type="number" className="form-input" value={p1Input.temperature} onChange={e => setP1Input({...p1Input, temperature: Number(e.target.value)})} />
            </div>
          </div>
          {p1Result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <strong>Result:</strong> Risk is <span style={{ color: '#10b981', fontWeight: 'bold' }}>{p1Result.spoilageRisk}</span> ({p1Result.priorityLevel}).
              Safe for another {p1Result.safeHoursRemaining} hours. {p1Result.recommendation}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#475569' }}><ArrowRight style={{ transform: 'rotate(90deg)', margin: '0 auto' }} /></div>

        {/* PHASE 2 */}
        <div className={`glass-panel ${activePhase === 2 ? 'border-primary' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert color="#f59e0b" /> Phase 2: Urgency Priority</h3>
            <button className="btn btn-secondary" onClick={runPhase2} disabled={!p1Result || loading} style={{ padding: '0.5rem 1rem' }}><Play size={16} /> Calculate</button>
          </div>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div>
              <label className="form-label">Quantity (Meals)</label>
              <input type="number" className="form-input" value={p2Input.quantityMeals} onChange={e => setP2Input({...p2Input, quantityMeals: Number(e.target.value)})} />
            </div>
            <div>
              <label className="form-label">NGO Urgency (1-10)</label>
              <input type="number" max="10" min="1" className="form-input" value={p2Input.ngoUrgency} onChange={e => setP2Input({...p2Input, ngoUrgency: Number(e.target.value)})} />
            </div>
          </div>
          {p2Result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
              <strong>Priority Score:</strong> <span style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 'bold' }}>{p2Result.priorityScore}</span> ({p2Result.priorityCategory})
              <br/><small>{p2Result.recommendedAction}</small>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#475569' }}><ArrowRight style={{ transform: 'rotate(90deg)', margin: '0 auto' }} /></div>

        {/* PHASE 3 */}
        <div className={`glass-panel ${activePhase === 3 ? 'border-primary' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation color="#3b82f6" /> Phase 3: NGO Matchmaking</h3>
            <button className="btn btn-primary" onClick={runPhase3} disabled={!p2Result || loading} style={{ padding: '0.5rem 1rem' }}><Play size={16} /> Find Match</button>
          </div>
          {p3Result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
              <strong>Best Match:</strong> {p3Result.bestMatch.ngoName} — score {p3Result.bestMatch.matchingScore}, {p3Result.bestMatch.distanceKm.toFixed(1)} km away
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#475569' }}><ArrowRight style={{ transform: 'rotate(90deg)', margin: '0 auto' }} /></div>

        {/* PHASE 4 */}
        <div className={`glass-panel ${activePhase === 4 ? 'border-primary' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck color="#8b5cf6" /> Phase 4: Truck Assignment</h3>
            <button className="btn btn-secondary" onClick={runPhase4} disabled={!p3Result || loading} style={{ padding: '0.5rem 1rem' }}><Play size={16} /> Dispatch</button>
          </div>
          {p4Result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
              <strong>Assignment:</strong> {p4Result.assignedTruck} — {p4Result.totalDistanceKm.toFixed(1)} km, ETA {p4Result.estimatedTime}. Route: {p4Result.optimizedRoute.join(' → ')}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#475569' }}><ArrowRight style={{ transform: 'rotate(90deg)', margin: '0 auto' }} /></div>

        {/* PHASE 5 */}
        <div className={`glass-panel ${activePhase === 5 ? 'border-primary' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapIcon color="#ec4899" /> Phase 5: Live Routing</h3>
            <button className="btn btn-primary" onClick={runPhase5} disabled={!p4Result || loading} style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}><Play size={16} /> Optimize Route</button>
          </div>
          {p5Result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px' }}>
              <strong>Optimized Route:</strong> {p5Result.totalDistanceKm.toFixed(1)} km in {p5Result.estimatedTotalTime}. Stops: {p5Result.optimizedRoute.map((s: { stop: string }) => s.stop).join(' → ')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
