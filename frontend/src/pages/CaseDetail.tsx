import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { casesApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export const CaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesApi.getById(Number(id)),
  })

  const caseData = data?.data

  const handleClaim = async () => {
    if (!user) return
    try {
      await casesApi.claim(Number(id), {
        organizationId: user.organizationId,
        userId: user.id,
      })
      window.location.reload()
    } catch (error) {
      alert('Failed to claim case')
    }
  }

  if (isLoading) {
    return <div className="loading">Loading case details...</div>
  }

  if (!caseData) {
    return <div className="loading">Case not found</div>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#c62828'
      case 'high': return '#e65100'
      case 'medium': return '#f57c00'
      case 'low': return '#388e3c'
      default: return '#757575'
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Dashboard
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{caseData.defendant_name}</h1>
            <div style={{ color: '#666', marginBottom: '1rem' }}>
              Case #{caseData.case_number} | {caseData.county} County
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: caseData.priority_score >= 75 ? '#c62828' : '#1976d2'
            }}>
              {caseData.priority_score?.toFixed(1)}
            </div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Priority Score</div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <div>
            <strong>Charge:</strong> {caseData.crime_charged}
          </div>
          <div>
            <strong>Court:</strong> {caseData.court_name || 'N/A'}
          </div>
          <div>
            <strong>Conviction Date:</strong>{' '}
            {caseData.conviction_date 
              ? new Date(caseData.conviction_date).toLocaleDateString()
              : 'N/A'}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span style={{ textTransform: 'capitalize' }}>
              {caseData.case_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {caseData.sentence && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Sentence:</strong> {caseData.sentence}
          </div>
        )}

        {caseData.case_status === 'flagged' && (
          <button 
            onClick={handleClaim}
            className="btn btn-success"
            style={{ marginTop: '1.5rem' }}
          >
            Claim This Case for Investigation
          </button>
        )}

        {caseData.claimed_by_org_id && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#e3f2fd',
            borderRadius: '4px'
          }}>
            This case has been claimed for investigation
          </div>
        )}
      </div>

      {caseData.demographics && (
        <div className="card">
          <div className="card-header">Demographics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <strong>Age at Conviction:</strong>{' '}
              {caseData.demographics.age || 'N/A'}
            </div>
            <div>
              <strong>Race:</strong> {caseData.demographics.race || 'N/A'}
            </div>
            <div>
              <strong>Gender:</strong> {caseData.demographics.gender || 'N/A'}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          Detected Indicators ({caseData.indicators?.length || 0})
        </div>

        {caseData.indicators && caseData.indicators.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {caseData.indicators.map((indicator: any) => (
              <div 
                key={indicator.id}
                style={{ 
                  border: '1px solid #e0e0e0',
                  borderLeft: `4px solid ${getSeverityColor(indicator.severity)}`,
                  padding: '1rem',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.125rem' }}>{indicator.name}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      background: getSeverityColor(indicator.severity),
                      color: 'white',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {indicator.severity}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>
                      Confidence: {(indicator.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  Category: {indicator.category}
                </div>

                {indicator.citations && indicator.citations.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Evidence Citations:
                    </strong>
                    {indicator.citations.map((citation: any, idx: number) => (
                      <div 
                        key={idx}
                        style={{ 
                          background: '#f9f9f9',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <strong>{citation.document_type}</strong>
                          {citation.page_number && ` | Page ${citation.page_number}`}
                          {citation.line_number && ` | Line ${citation.line_number}`}
                        </div>
                        {citation.quoted_text && (
                          <div style={{ 
                            fontStyle: 'italic',
                            color: '#444',
                            padding: '0.5rem',
                            background: 'white',
                            borderLeft: '3px solid #ddd',
                            marginTop: '0.5rem'
                          }}>
                            "{citation.quoted_text}"
                          </div>
                        )}
                        {citation.context_before && (
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                            Context: {citation.context_before}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No indicators detected for this case</p>
        )}
      </div>
    </div>
  )
}