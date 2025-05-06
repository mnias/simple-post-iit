import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import { getPostIts, savePostIt, deletePostIt, updatePostIt } from '../util/storage';
import { PostItData } from '../types/post-it';
import PostItList from './post-it-list';

const Sidepanel = () => {
  const [text, setText] = React.useState('');
  const [selectedPostIt, setSelectedPostIt] = React.useState<PostItData | null>(null);
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
      } else {
        setSavedPostIts([]);
      }
    } catch (error) {
      console.error('Error loading post-its:', error);
    }
  };

  // URL 변경 감지 및 포스트잇 로드
  React.useEffect(() => {
    // 초기 로드
    loadCurrentTabPostIts();

    // 탭 변경 감지
    const handleTabChange = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      await loadCurrentTabPostIts();
    };

    // URL 변경 감지
    const handleURLChange = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.url) {
        loadCurrentTabPostIts();
      }
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleURLChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleURLChange);
    };
  }, []);

  // 메시지 리스너
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
        await loadCurrentTabPostIts(); // 저장 후 목록 갱신
      }
      
      if (message.type === 'deletePostIt') {
        await deletePostIt(message.postItData.url, message.postItData.id);
        await loadCurrentTabPostIts(); // 삭제 후 목록 갱신
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [text]);

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

  const handleDelete = async (postIt: PostItData) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.url) return;

      // storage에서 삭제
      await deletePostIt(tab.url, postIt.id);
      
      // DOM에서 삭제하도록 메시지 전송
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'deletePostIt',
          postItData: {
            id: postIt.id,
            url: tab.url
          }
        });
      }

      // 목록 갱신
      await loadCurrentTabPostIts();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handlePostItSelect = (postIt: PostItData) => {
    setSelectedPostIt(postIt);
    setText(postIt.text);
  };

  const handleUpdate = async () => {
    if (!selectedPostIt) return;

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id || !tab.url) return;

      // Update in storage
      const updatedPostIt = {
        ...selectedPostIt,
        text,
      };
      await updatePostIt(tab.url, updatedPostIt);

      // Send message to update DOM
      chrome.tabs.sendMessage(tab.id, {
        type: 'updatePostIt',
        postItData: updatedPostIt,
      });

      // Reset selection and refresh list
      setSelectedPostIt(null);
      setText('');
      await loadCurrentTabPostIts();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="flex flex-col gap-2">
        <textarea
          className="bg-amber-200 p-8 rounded-lg focus:outline-none h-200 text-[16px] resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2">
          {selectedPostIt ? (
            <>
              <button
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all"
                onClick={handleUpdate}
              >
                업데이트
              </button>
              <button
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-all"
                onClick={() => {
                  setSelectedPostIt(null);
                  setText('');
                }}
              >
                취소
              </button>
            </>
          ) : (
            <button
              className="flex-1 bg-blue-500 text-white p-2 rounded"
              draggable
              onDragStart={startDrag}
            >
              붙이기
            </button>
          )}
        </div>
      </div>
      <PostItList 
        postIts={savedPostIts} 
        onDelete={handleDelete}
        onSelect={handlePostItSelect}
      />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<Sidepanel />);
