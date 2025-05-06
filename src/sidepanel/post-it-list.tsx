import React from 'react';
import { PostItData } from '../types/post-it';

interface PostItListProps {
  postIts: PostItData[];
}

const PostItList: React.FC<PostItListProps> = ({ postIts }) => {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">저장된 메모</h2>
      <div className="space-y-2">
        {postIts.map((postIt) => (
          <div key={postIt.id} className="bg-amber-100 p-2 rounded shadow-sm">
            <div className="text-sm text-gray-600">
              {new Date(postIt.createdAt).toLocaleString()}
            </div>
            <div className="mt-1">{postIt.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostItList;
