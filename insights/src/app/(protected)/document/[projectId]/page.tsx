import { prisma } from '@/lib/db';
import SummaryPage from './chatProject'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import AiChatPdfBot from '@/components/AichatPdfBot';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function ChatPdfPage({ params }: Props) {
  const { projectId } = await params;
  console.log("projectId", projectId);


  const project = await prisma.chatPdf.findUnique({
    where: { id: projectId },
    select: { content: true },
  });
  const content = project?.content ?? 'No content available for this video.';

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="lg:w-1/2 w-full flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1 h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ">
            <SummaryPage content={content} projectId={projectId} />
          </ScrollArea>
        </div>
        <div className="lg:w-1/2 w-full flex flex-col h-172 overflow-hidden">
          <AiChatPdfBot moduleId={projectId} />
        </div>
      </div>
    </div>
  );
}

export default ChatPdfPage;