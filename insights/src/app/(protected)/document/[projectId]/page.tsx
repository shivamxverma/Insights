import SummaryPage from './chatProject';
import { ScrollArea } from '@/components/ui/scroll-area';
import AiChatPdfBot from '@/components/AichatPdfBot';
import { chatPdfContent } from '@/lib/query';

// Define the Props interface to match Next.js expectations for async pages
interface Props {
  params: Promise<{ projectId: string }>; // params is a Promise that resolves to { projectId: string }
}

export default async function ChatPdfPage({ params }: Props) {
  const { projectId } = await params; // Await the params Promise to get the actual object
  console.log("projectId", projectId);
  const content = await chatPdfContent(projectId);

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="lg:w-1/2 w-full flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1 h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <SummaryPage content={content} projectId={projectId} />
          </ScrollArea>
        </div>
        <div className="lg:w-1/2 w-full flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <AiChatPdfBot moduleId={projectId} />
        </div>
      </div>
    </div>
  );
}