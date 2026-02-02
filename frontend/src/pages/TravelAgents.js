// frontend/src/pages/TravelAgents.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPlane } from 'react-icons/fa';
import { travelAgentAPI } from '../services/api';
import { toast } from 'react-toastify';

const TravelAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [statusFilter, agents]);

  const fetchAgents = async () => {
    try {
      const response = await travelAgentAPI.getAgents();
      setAgents(response.data);
      setFilteredAgents(response.data);
    } catch (error) {
      toast.error('Failed to load travel agents');
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    if (statusFilter === 'all') {
      setFilteredAgents(agents);
    } else {
      setFilteredAgents(agents.filter(agent => agent.status === statusFilter));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this travel agent?')) return;

    try {
      await travelAgentAPI.deleteAgent(id);
      toast.success('Travel agent deleted successfully');
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete agent');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Active': 'badge-success',
      'Inactive': 'badge-secondary',
      'Suspended': 'badge-danger'
    };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Travel Agents</h1>
        <div className="topbar-actions">
          <button onClick={() => navigate('/travel-agents/new')} className="btn btn-primary">
            <FaPlus /> Add New Agent
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="filters">
          <div className="filter-row">
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="empty-state">
            <FaPlane />
            <h3>No travel agents found</h3>
            <p>Add a travel agent to start receiving bookings</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Agent Code</th>
                    <th>Contact Person</th>
                    <th>Contact</th>
                    <th>Commission</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr key={agent._id}>
                      <td>
                        <strong>{agent.companyName}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {agent.agentName}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{agent.agentCode}</span>
                      </td>
                      <td>{agent.contactPerson}</td>
                      <td>
                        <div>{agent.email}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {agent.phone}
                        </div>
                      </td>
                      <td>{agent.commissionRate}%</td>
                      <td>{agent.totalBookings || 0}</td>
                      <td>₹{(agent.totalRevenue || 0).toLocaleString()}</td>
                      <td>{getStatusBadge(agent.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/travel-agents/${agent._id}`)}
                            className="btn btn-sm btn-outline"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/travel-agents/${agent._id}/edit`)}
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(agent._id)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelAgents;