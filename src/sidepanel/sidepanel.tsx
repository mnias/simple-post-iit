// 처음에 이 파일에서 직접 DOM 조작이나 이벤트 리스너를 처리함
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import { savePostIt } from '../util/storage';

const Sidepanel = () => {
  const [text, setText] = React.useState('');

  const startDrag = async (e: React.DragEvent<HTMLButtonElement>) => {
    try {
      // 현재 탭 찾기
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        return;
      }

      // 메시지 전송
      await chrome.tabs.sendMessage(tab.id, {
        type: 'dragStart',
      });
    } catch (error) {
      console.error('Drag start error:', error);
    }
  };

  React.useEffect(() => {
    const messageListener = async (message: any, sender: any, sendResponse: any) => {
      if (message.type === 'savePostIt') {
        const postItData = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text,
          position: message.postItData.position,
          createdAt: Date.now(),
        };

        await savePostIt(message.postItData.url, postItData);
        console.log('Post-it saved:', postItData);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [text]);

  return (
    <div className="flex flex-col p-4 gap-4">
      <textarea
        className="bg-amber-200 p-8 rounded-lg focus:outline-none h-200 text-[16px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-row gap-4">
        <button className="bg-blue-500 text-white p-2 rounded" draggable onDragStart={startDrag}>
          붙이기
        </button>
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => setText('')}>
          지우기
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<Sidepanel />);
