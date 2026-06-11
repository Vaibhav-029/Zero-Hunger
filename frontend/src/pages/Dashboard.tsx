import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  donateFood, getAllFood, 
  claimFood, getAllRequests
} from '../services/api';
import type { FoodDonation, NgoRequest } from '../services/api';
import { Plus, Package, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Data states
  const [foods, setFoods] = useState<FoodDonation[]>([]);
  const [requests, setRequests] = useState<NgoRequest[]>([]);
  
  // Form states
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryHours, setExpiryHours] = useState(24);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const foodRes = await getAllFood();
      setFoods(foodRes.data);
      
      const reqRes = await getAllRequests();
      setRequests(reqRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiryTime = new Date(Date.now() + expiryHours * 3600 * 1000).toISOString();
    try {
      await donateFood({
        foodName,
        quantity,
        expiryTime,
        donorId: user.id
      });
      alert('Food donated successfully!');
      setFoodName('');
      setQuantity(1);
      fetchData();
    } catch (err) {
      alert('Failed to donate food');
    }
  };

  const handleClaim = async (food: FoodDonation) => {
    try {
      await claimFood({
        foodDonation: { id: food.id! },
        ngo: { id: user.id },
        quantityRequested: food.quantity
      });
      alert('Food claimed successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to claim food');
    }
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome to your Dashboard, {user.username}!</h2>
        <span className={`badge badge-info`}>{user.role}</span>
      </div>

      <div className="grid grid-cols-2">
        {/* Left Column: Actions based on role */}
        <div className="glass-panel">
          {user.role === 'DONOR' && (
            <>
              <h3><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Donate Food</h3>
              <form onSubmit={handleDonate} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Food Description</label>
                  <input type="text" className="form-input" value={foodName} onChange={e => setFoodName(e.target.value)} required placeholder="e.g., 50 boxes of rice and curry" />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity (Meals)</label>
                  <input type="number" min="1" className="form-input" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expires in (Hours)</label>
                  <input type="number" min="1" className="form-input" value={expiryHours} onChange={e => setExpiryHours(parseInt(e.target.value))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Donation</button>
              </form>
            </>
          )}

          {user.role === 'NGO' && (
            <>
              <h3><MapPin size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Available Food</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {foods.filter(f => f.status === 'AVAILABLE').length === 0 && <p>No available food at the moment.</p>}
                {foods.filter(f => f.status === 'AVAILABLE').map(food => (
                  <div key={food.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{food.foodName}</h4>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}><Package size={14} /> {food.quantity} meals</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--danger-color)' }}><Clock size={14} /> Expires: {new Date(food.expiryTime).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleClaim(food)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Claim</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {(user.role === 'DRIVER' || user.role === 'ADMIN') && (
            <>
              <h3><ShieldCheck size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Logistics Mission Panel</h3>
              <p>As a driver/admin, you can view the active requests.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.filter(r => r.requestStatus === 'PENDING').length === 0 && <p>No pending logistics missions.</p>}
                {requests.filter(r => r.requestStatus === 'PENDING').map(req => (
                  <div key={req.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <h4>Request #{req.id}</h4>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>NGO ID: {req.ngo?.id} requested Food ID: {req.foodDonation?.id}</p>
                    <span className="badge badge-warning">Pending Logistics</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Global or History Feed */}
        <div className="glass-panel">
          <h3>Recent System Activity</h3>
          <div style={{ marginTop: '1.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' }}>
            <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>All Donations</h4>
            {foods.length === 0 && <p style={{ fontSize: '0.875rem' }}>No donations yet.</p>}
            {foods.slice().reverse().map(f => (
              <div key={f.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontWeight: '500' }}>{f.foodName}</span> ({f.quantity} meals)
                <div style={{ marginTop: '0.25rem' }}>
                  <span className={`badge ${f.status === 'AVAILABLE' ? 'badge-success' : f.status === 'REQUESTED' ? 'badge-warning' : 'badge-info'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
