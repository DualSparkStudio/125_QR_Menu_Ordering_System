'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const { staff, token } = useAuthStore();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [billImage, setBillImage] = useState<string>('');
  const [billImageLabel, setBillImageLabel] = useState<string>('Scan to Pay');

  useEffect(() => {
    if (!staff?.restaurantId || !token) return;
    adminApi.getRestaurant(staff.restaurantId, token).then((data: any) => {
      setRestaurant(data);
      setForm({ name: data.name, description: data.description || '', phone: data.phone, email: data.email, address: data.address, taxPercentage: data.taxPercentage, serviceChargePercentage: data.serviceChargePercentage, isOpen: data.isOpen });
    });
    // Load bill image from localStorage
    const savedImage = localStorage.getItem(`billImage_${staff.restaurantId}`);
    const savedLabel = localStorage.getItem(`billImageLabel_${staff.restaurantId}`);
    if (savedImage) setBillImage(savedImage);
    if (savedLabel) setBillImageLabel(savedLabel);
  }, [staff, token]);

  const handleBillImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Image must be under 500KB for thermal printing');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setBillImage(base64);
      localStorage.setItem(`billImage_${staff?.restaurantId}`, base64);
    };
    reader.readAsDataURL(file);
  };

  const saveBillImageLabel = () => {
    localStorage.setItem(`billImageLabel_${staff?.restaurantId}`, billImageLabel);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeBillImage = () => {
    setBillImage('');
    localStorage.removeItem(`billImage_${staff?.restaurantId}`);
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Restaurant name must be at least 2 characters';
    }
    
    if (!form.phone || !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.address || form.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }
    
    if (form.taxPercentage < 0 || form.taxPercentage > 100) {
      newErrors.taxPercentage = 'Tax must be between 0 and 100%';
    }
    
    if (form.serviceChargePercentage < 0 || form.serviceChargePercentage > 100) {
      newErrors.serviceChargePercentage = 'Service charge must be between 0 and 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async () => {
    if (!staff?.restaurantId || !token) return;
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try { 
      await adminApi.updateRestaurant(staff.restaurantId, form, token); 
      setSaved(true); 
      setErrors({});
      setTimeout(() => setSaved(false), 3000); 
    }
    catch (err: any) {
      setErrors({ general: err.message || 'Failed to save settings' });
    }
    finally { setSaving(false); }
  };

  const handleInputChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const F = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  if (!restaurant) return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-400 text-xs mt-0.5">Restaurant profile & configuration</p>
        </div>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 text-sm mb-4 uppercase tracking-wider">Basic Info</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label="Restaurant Name" error={errors.name}>
                  <input value={form.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="input" required />
                </F>
                <F label="Phone" error={errors.phone}>
                  <input value={form.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="input" type="tel" required />
                </F>
              </div>
              <F label="Email" error={errors.email}>
                <input value={form.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} type="email" className="input" required />
              </F>
              <F label="Address" error={errors.address}>
                <input value={form.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="input" required />
              </F>
              <F label="Description">
                <textarea value={form.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={2} className="input resize-none" />
              </F>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 text-sm mb-4 uppercase tracking-wider">Pricing & Taxes</h2>
            <div className="grid grid-cols-2 gap-3">
              <F label="Tax (%)" error={errors.taxPercentage}>
                <input value={form.taxPercentage || 0} onChange={(e) => handleInputChange('taxPercentage', parseFloat(e.target.value) || 0)} type="number" min="0" max="100" step="0.5" className="input" />
              </F>
              <F label="Service Charge (%)" error={errors.serviceChargePercentage}>
                <input value={form.serviceChargePercentage || 0} onChange={(e) => handleInputChange('serviceChargePercentage', parseFloat(e.target.value) || 0)} type="number" min="0" max="100" step="0.5" className="input" />
              </F>
            </div>
          </div>

          {/* Status */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 text-sm mb-4 uppercase tracking-wider">Restaurant Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Accept Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Toggle to open or close your restaurant for new orders</p>
              </div>
              <button onClick={() => setForm((f: any) => ({ ...f, isOpen: !f.isOpen }))}
                className={`relative w-14 h-7 rounded-full transition-all ${form.isOpen ? 'bg-green-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${form.isOpen ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${form.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${form.isOpen ? 'bg-green-500 live-dot' : 'bg-gray-300'}`} />
              {form.isOpen ? 'Restaurant is Open' : 'Restaurant is Closed'}
            </div>
          </div>

          {/* Bill Payment Image */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 text-sm mb-1 uppercase tracking-wider">Bill Payment Image</h2>
            <p className="text-xs text-gray-400 mb-4">Upload a QR code or payment image to print at the bottom of every bill (max 500KB)</p>
            
            {billImage ? (
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <img src={billImage} alt="Bill payment" className="w-24 h-24 object-contain border border-gray-200 rounded-xl bg-gray-50" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="label">Image Label</label>
                      <input
                        value={billImageLabel}
                        onChange={(e) => setBillImageLabel(e.target.value)}
                        placeholder="e.g. Scan to Pay, UPI Payment"
                        className="input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveBillImageLabel} className="btn-primary text-xs px-4 py-2">Save Label</button>
                      <button onClick={removeBillImage} className="btn-danger text-xs px-4 py-2">Remove Image</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                <span className="text-3xl mb-2">📷</span>
                <span className="text-sm font-semibold text-gray-500">Click to upload payment QR</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 500KB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleBillImageUpload} />
              </label>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
              <span>⚠️</span> {errors.general}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm flex items-center gap-2">
              <span>✓</span> Settings saved successfully
            </div>
          )}

          <button onClick={save} disabled={saving} className="btn-primary w-full py-3.5 text-base">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
