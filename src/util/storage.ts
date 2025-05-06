import { PostItData } from '../types/post-it';
import { StorageData } from '../types/storage-data';
import { parseUrl } from './parseUrl';

export const savePostIt = async (
  url: string,
  postItData: Omit<PostItData, 'hostname' | 'path'>,
) => {
  const { hostname, path } = parseUrl(url);

  // 현재 호스트의 데이터 가져오기
  const result = await chrome.storage.local.get(hostname);
  const hostData = result[hostname] || {};

  // 현재 경로의 포스트잇 배열
  const pathPostIts = hostData[path] || [];

  // 새 포스트잇 추가
  const newPostIt: PostItData = {
    ...postItData,
    hostname,
    path,
  };

  hostData[path] = [...pathPostIts, newPostIt];

  // 저장
  await chrome.storage.local.set({ [hostname]: hostData });
};

export const getPostIts = async (url: string) => {
  const { hostname, path } = parseUrl(url);

  // 호스트의 모든 데이터 가져오기
  const result = await chrome.storage.local.get(hostname);
  const hostData = result[hostname] || {};

  // 특정 경로의 포스트잇 반환
  return hostData[path] || [];
};

export const deletePostIt = async (url: string, postItId: string) => {
  const { hostname, path } = parseUrl(url);

  const result = await chrome.storage.local.get(hostname);
  const hostData = result[hostname] || {};
  const pathPostIts = hostData[path] || [];

  hostData[path] = pathPostIts.filter((postIt: PostItData) => postIt.id !== postItId);

  await chrome.storage.local.set({ [hostname]: hostData });
};

export const updatePostIt = async (url: string, updatedPostIt: PostItData) => {
  const { hostname, path } = parseUrl(url);
  
  const result = await chrome.storage.local.get(hostname);
  const hostData = result[hostname] || {};
  const pathPostIts = hostData[path] || [];

  hostData[path] = pathPostIts.map((postIt: PostItData) => 
    postIt.id === updatedPostIt.id ? updatedPostIt : postIt
  );

  await chrome.storage.local.set({ [hostname]: hostData });
};
