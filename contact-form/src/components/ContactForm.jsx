import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Eye, Plus, X, Loader2 } from 'lucide-react';

const API_BASE = 'https://jsonplaceholder.typicode.com/users';

export default function ContactForm() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [errors, setErrors] = useState({});

  // Load initial contacts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      const formatted = data.slice(0, 5).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company?.name || 'N/A'
      }));
      setContacts(formatted);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (editMode) {
        // Update existing contact
        const response = await fetch(`${API_BASE}/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          setContacts(contacts.map(c => 
            c.id === formData.id ? formData : c
          ));
        }
      } else {
        // Create new contact
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const newContact = await response.json();
        const contactToAdd = {
          ...formData,
          id: newContact.id
        };
        setContacts([contactToAdd, ...contacts]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData(contact);
    setEditMode(true);
    setShowForm(true);
  };

  const handleView = async (contact) => {
    setSelectedContact(contact);
    setShowDetails(true);
    setDetailsLoading(true);
    
    // Simulate fetching additional details
    try {
      const response = await fetch(`${API_BASE}/${contact.id}`);
      const data = await response.json();
      setSelectedContact({
        ...contact,
        website: data.website || 'N/A',
        address: data.address ? `${data.address.street}, ${data.address.city}` : 'N/A'
      });
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '' });
    setErrors({});
    setShowForm(false);
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Contact Manager</h1>
              <p className="text-purple-200">Manage your contacts with full CRUD operations</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Contact
            </button>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editMode ? 'Edit Contact' : 'New Contact'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedContact && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              {detailsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin text-purple-500" size={40} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg text-gray-800">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg text-gray-800">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg text-gray-800">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-lg text-gray-800">{selectedContact.company}</p>
                  </div>
                  {selectedContact.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-lg text-gray-800">{selectedContact.website}</p>
                    </div>
                  )}
                  {selectedContact.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-lg text-gray-800">{selectedContact.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {loading && !showForm ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white text-lg">No contacts yet. Add your first contact!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">{contact.name}</td>
                      <td className="px-6 py-4 text-white">{contact.email}</td>
                      <td className="px-6 py-4 text-white">{contact.phone}</td>
                      <td className="px-6 py-4 text-white">{contact.company}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(contact)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(contact)}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}