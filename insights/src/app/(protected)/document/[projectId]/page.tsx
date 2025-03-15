
import { prisma } from '@/lib/db';
import React from 'react'
import SummaryPage from './chatProject';
import { cos } from 'mathjs';

interface Props {
  params: Promise<{  projectId: string}>;
}
export  async function ChatPdfPage( props : Props){
  const { projectId } = await props.params;
  console.log("projectId",projectId)

  const project = await prisma.chatPdf.findUnique({
    where: {
      id: projectId,
    },
    select: {
      content: true,
    },
  })
  return (
    <div>
     <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Chat Section</h2>
            {/* Pass the project URL as a prop to the chat component (e.g. as namespace) */}
            <SummaryPage content={project?.content ?? ''} projectId={projectId} />
          </div>
    </div>
  )
}
export default ChatPdfPage
