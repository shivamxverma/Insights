import React, { useEffect, useState } from 'react'

interface TranscriptProps {
  moduleId: string
  videoId: string
}

const Transcript: React.FC<TranscriptProps> = ({ moduleId, videoId }) => {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscript = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/getTranscript?moduleId=${moduleId}&videoId=${videoId}`)
        const data = await res.json()

        if (res.ok) {
          setTranscript(data.transcript)
        } else {
          setError(data.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Error fetching transcript:', error)
        setError('Failed to fetch transcript.')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [moduleId, videoId])

  return (
    <div>
      <h1>Transcript</h1>
      {loading ? (
        <p>Loading transcript...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <p>{transcript}</p>
      )}
    </div>
  )
}

export default Transcript
