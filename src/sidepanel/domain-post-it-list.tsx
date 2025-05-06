import React from 'react';
import { PostItData } from '../types/post-it';

interface PathGroup {
  path: string;
  postIts: PostItData[];
}

interface DomainGroup {
  hostname: string;
  paths: PathGroup[];
  totalCount: number;
}

interface DomainPostItListProps {
  allPostIts: Record<string, PostItData[]>;
  onPostItClick: (hostname: string, path: string) => void;
}

const DomainPostItList: React.FC<DomainPostItListProps> = ({ allPostIts, onPostItClick }) => {
  const [expandedDomain, setExpandedDomain] = React.useState<string | null>(null);
  const [expandedPath, setExpandedPath] = React.useState<string | null>(null);

  const domainGroups = React.useMemo((): DomainGroup[] => {
    return Object.entries(allPostIts).map(([hostname, pathData]) => {
      // pathData는 Record<path, PostItData[]> 형태
      const paths = Object.entries(pathData).map(([path, postIts]) => ({
        path,
        postIts: Array.isArray(postIts) ? postIts : []
      }));

      // 모든 경로의 포스트잇 개수 합산
      const totalCount = paths.reduce((sum, { postIts }) => sum + postIts.length, 0);

      return {
        hostname,
        paths,
        totalCount
      };
    });
  }, [allPostIts]);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">전체 포스트잇 목록</h2>
      <div className="space-y-2">
        {domainGroups.map(({ hostname, paths, totalCount }) => (
          <div key={hostname} className="border rounded-lg overflow-hidden">
            <button
              className="w-full p-2 bg-gray-100 hover:bg-gray-200 transition-all flex justify-between items-center"
              onClick={() => setExpandedDomain(expandedDomain === hostname ? null : hostname)}
            >
              <span className="font-medium">{hostname}</span>
              <span className="bg-amber-200 px-2 py-1 rounded-full text-sm">
                {totalCount}개
              </span>
            </button>
            {expandedDomain === hostname && (
              <div className="p-2 space-y-2 bg-gray-50">
                {paths.map(({ path, postIts }) => (
                  <div key={path} className="border rounded overflow-hidden">
                    <button
                      className="w-full p-2 bg-white hover:bg-gray-50 transition-all flex justify-between items-center text-sm"
                      onClick={() => setExpandedPath(expandedPath === path ? null : path)}
                    >
                      <span className="truncate flex-1 text-left text-blue-600">
                        {path || '/'}
                      </span>
                      <span className="bg-amber-100 px-2 py-1 rounded-full ml-2">
                        {postIts.length}개
                      </span>
                    </button>
                    {expandedPath === path && (
                      <div className="p-2 space-y-2 bg-white border-t">
                        {postIts.map((postIt) => (
                          <div
                            key={postIt.id}
                            className="bg-amber-50 p-2 rounded cursor-pointer hover:bg-amber-100 transition-all"
                            onClick={() => onPostItClick(hostname, path)}
                          >
                            <div className="text-sm text-gray-600">
                              {new Date(postIt.createdAt).toLocaleString()}
                            </div>
                            <div className="mt-1">{postIt.text || '내용 없음'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainPostItList;