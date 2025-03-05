import React from 'react'

interface Props {
  params: Promise<{ moduleId: string }>;
}

const VideoModules = async({ params }: Props) => {
  const { moduleId } = await params;
  return (
    <div>VideoModules
      {moduleId}
    </div>
  )
}

export default VideoModules