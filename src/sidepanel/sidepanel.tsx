// 처음에 이 파일에서 직접 DOM 조작이나 이벤트 리스너를 처리함
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import { getPostIts, savePostIt } from '../util/storage';
import { PostItData } from '../types/post-it';
import PostItList from './post-it-list';

const Sidepanel = () => {
  const [text, setText] = React.useState('');
  const [savedPostIts, setSavedPostIts] = React.useState<PostItData[]>([]);

  const loadCurrentTabPostIts = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.url) {
        const postIts = await getPostIts(tab.url);
        setSavedPostIts(postIts);
      }
    } catch (error) {
      console.error('Error loading post-its:', error);
    }
  };

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
          id: message.postItData.id,
          text,
          position: message.postItData.position,
          createdAt: Date.now(),
        };

        await savePostIt(message.postItData.url, postItData);
        console.log('Post-it saved:', postItData);

        // 포스트잇 저장 후 목록 갱신
        await loadCurrentTabPostIts();
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [text]);

  // 컴포넌트 마운트 및 탭 변경 시 포스트잇 로드
  React.useEffect(() => {
    loadCurrentTabPostIts();

    // 탭 변경 감지
    chrome.tabs.onActivated.addListener(loadCurrentTabPostIts);

    return () => {
      chrome.tabs.onActivated.removeListener(loadCurrentTabPostIts);
    };
  }, []);

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
      </div>
      <PostItList postIts={savedPostIts} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<Sidepanel />);
