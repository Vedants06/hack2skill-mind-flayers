import React, { useState } from 'react';
import { db, collection, addDoc } from '../firebase/firebase';

const AddDoctor: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    speciality: '',
    education: '',
    whatsapp: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await addDoc(collection(db, 'doctors'), {
        name: formData.name,
        location: formData.location,
        speciality: formData.speciality,
        education: formData.education,
        whatsapp: formData.whatsapp,
        ratings: parseFloat((Math.random() * 4 + 1).toFixed(1)),
        createdAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Doctor added successfully!' });
      setFormData({
        name: '',
        location: '',
        speciality: '',
        education: '',
        whatsapp: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding doctor. Please try again.' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Add New Doctor</h1>
            <p className="text-slate-600">Add doctor information to the database (Admin Only)</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Doctor Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Speciality *
              </label>
              <input
                type="text"
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Cardiology, Dermatology, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Education *
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="MD, Harvard Medical School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="+1234567890"
              />
              <p className="text-xs text-slate-500 mt-1">Note: This must be a valid WhatsApp number</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Doctor...' : 'Add Doctor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
