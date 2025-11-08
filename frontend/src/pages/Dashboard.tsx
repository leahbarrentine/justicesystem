import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { casesApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState('flagged')
  const [priorityFilter, setPriorityFilter] = useState(0)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['cases', statusFilter, priorityFilter],
    queryFn: () =>
      casesApi.getAll({
        status: statusFilter,
        minPriority: priorityFilter || undefined,
      }),
  })

  const cases = data?.data?.cases || []

  const getPriorityLabel = (score: number) => {
    if (score >= 75) return { label: 'Urgent', class: 'priority-urgent' }
    if (score >= 50) return { label: 'High', class: 'priority-high' }
    if (score >= 25) return { label: 'Medium', class: 'priority-medium' }
    return { label: 'Low', class: 'priority-low' }
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 style={{ marginBottom: '2rem' }}>WCDS</h2>
        <nav>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Welcome, {user?.firstName}</strong>
          </div>
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ marginTop: '2rem', width: '100%' }}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="header">
          <h1>Flagged Cases Dashboard</h1>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Case Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="flagged">Flagged</option>
                <option value="claimed">Claimed</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="closed">Closed</option>
                <option value="exonerated">Exonerated</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Minimum Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(Number(e.target.value))}
              >
                <option value={0}>All</option>
                <option value={25}>Medium+ (25+)</option>
                <option value={50}>High+ (50+)</option>
                <option value={75}>Urgent (75+)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="case-list">
          <h2 style={{ marginBottom: '1.5rem' }}>
            {cases.length} Cases Found
          </h2>

          {isLoading ? (
            <div className="loading">Loading cases...</div>
          ) : cases.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No cases match the current filters
            </p>
          ) : (
            cases.map((caseItem: any) => {
              const priority = getPriorityLabel(caseItem.priority_score || 0)
              return (
                <div
                  key={caseItem.id}
                  className="case-card"
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.125rem' }}>
                        {caseItem.defendant_name}
                      </strong>
                      <div style={{ color: '#666', fontSize: '0.875rem' }}>
                        Case #{caseItem.case_number} | {caseItem.county} County
                      </div>
                    </div>
                    <div>
                      <span className={`priority-badge ${priority.class}`}>
                        {priority.label} ({caseItem.priority_score?.toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Charge:</strong> {caseItem.crime_charged}
                  </div>

                  {caseItem.conviction_date && (
                    <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Convicted: {new Date(caseItem.conviction_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}