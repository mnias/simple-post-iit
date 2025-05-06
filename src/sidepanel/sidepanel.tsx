import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import { getPostIts, savePostIt, deletePostIt, updatePostIt } from '../util/storage';
import { PostItData } from '../types/post-it';
import PostItList from './post-it-list';
import DomainPostItList from './domain-post-it-list';

const Sidepanel = () => {
  const [text, setText] = React.useState('');
  const [selectedPostIt, setSelectedPostIt] = React.useState<PostItData | null>(null);
  const [savedPostIts, setSavedPostIts] = React.useState<PostItData[]>([]);
  const [allPostIts, setAllPostIts] = React.useState<Record<string, PostItData[]>>({});

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

  // 모든 포스트잇 로드
  const loadAllPostIts = async () => {
    try {
      const result = await chrome.storage.local.get(null);
      setAllPostIts(result);
    } catch (error) {
      console.error('Error loading all post-its:', error);
    }
  };

  // 초기 로드
  React.useEffect(() => {
    loadAllPostIts();
  }, []);

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
        await Promise.all([
          loadCurrentTabPostIts(),
          loadAllPostIts() // 전체 목록도 갱신
        ]);
      }

      if (message.type === 'deletePostIt') {
        await deletePostIt(message.postItData.url, message.postItData.id);
        await Promise.all([
          loadCurrentTabPostIts(),
          loadAllPostIts() // 전체 목록도 갱신
        ]);
      }

      if (message.type === 'selectPostIt') {
        // 현재 URL의 포스트잇 데이터 가져오기
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab?.url) {
          const postIts = await getPostIts(tab.url);
          const selectedPostIt = postIts.find((p: PostItData) => p.id === message.postItData.id);

          if (selectedPostIt) {
            setSelectedPostIt(selectedPostIt);
            setText(selectedPostIt.text);
          }
        }
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
            url: tab.url,
          },
        });
      }

      // 목록 갱신
      await loadCurrentTabPostIts();
      await loadAllPostIts(); // 전체 목록 갱신
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
      await loadAllPostIts(); // 전체 목록 갱신
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // 포스트잇 클릭 시 해당 URL로 이동
  const handlePostItClick = async (hostname: string, path: string) => {
    try {
      // URL 생성
      const url = `${hostname}${path}`;

      // chrome-extension:// 프로토콜이 포함된 경우 제거
      const cleanUrl = url.includes('chrome-extension://')
        ? url.split('chrome-extension://')[1].split('/', 2)[1]
        : url;

      // 프로토콜이 없는 경우 https:// 추가
      const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

      // 현재 탭의 URL 변경
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { url: finalUrl });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      {/* 포스트잇 작성 영역 - 전체 높이의 30% */}
      <div className="flex flex-col gap-2 h-[30%]">
        <textarea
          className="flex-1 bg-amber-200 p-4 rounded-lg focus:outline-none text-[16px] resize-none"
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

      {/* 리스트 영역 - 전체 높이의 70%, 세로로 분할 */}
      <div className="flex-1 flex flex-col gap-4 h-[70%] min-h-0">
        {/* 현재 페이지 포스트잇 목록 - 상단 50% */}
        <div className="h-1/2 overflow-auto">
          <PostItList 
            postIts={savedPostIts} 
            onDelete={handleDelete} 
            onSelect={handlePostItSelect} 
          />
        </div>

        {/* 구분선 */}
        <hr className="border-t border-gray-200" />

        {/* 전체 포스트잇 목록 - 하단 50% */}
        <div className="h-1/2 overflow-auto">
          <DomainPostItList 
            allPostIts={allPostIts} 
            onPostItClick={handlePostItClick} 
          />
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<Sidepanel />);
