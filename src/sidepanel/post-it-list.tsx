import React from 'react';
import { PostItData } from '../types/post-it';

interface PostItListProps {
  postIts: PostItData[];
  onDelete: (postIt: PostItData) => void;
}

const PostItList: React.FC<PostItListProps> = ({ postIts, onDelete }) => {
  const handleDelete = async (postIt: PostItData) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // 화면의 포스트잇 제거를 위한 메시지 전송
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'removePostIt',
          postItId: postIt.id,
        });
      }

      // 저장소에서 삭제 및 목록 갱신
      onDelete(postIt);
    } catch (error) {
      console.error('Error deleting post-it:', error);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">저장된 메모</h2>
      <div className="space-y-2">
        {postIts.map((postIt) => (
          <div
            key={postIt.id}
            className="bg-amber-100 p-2 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-sm text-gray-600">
                {new Date(postIt.createdAt).toLocaleString()}
              </div>
              <div className="mt-1">{postIt.text}</div>
            </div>
            <button
              onClick={() => handleDelete(postIt)}
              className="w-40 h-40 text-2xl font-bold bg-red-500 flex items-center justify-center text-white opacity-80 hover:opacity-100 hover:bg-red-600 transition-all leading-none ml-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostItList;
