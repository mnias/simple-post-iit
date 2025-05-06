// 웹 페이지에 삽입되어 확장 프로그램이 페이지의 콘텐츠와 상호작용되는 부분
import { PostItData } from '../types/post-it';
import { getPostIts } from '../util/storage';
import { createPostIt } from './create-postit';

let isDraggable = false;
let isInitialized = false; // 초기화 여부 체크

console.log('Content script loaded');
const restorePostIts = async () => {
  try {
    const currentUrl = window.location.href;
    const savedPostIts = await getPostIts(currentUrl);

    console.log('Restoring post-its:', savedPostIts);

    savedPostIts.forEach((postIt: PostItData) => {
      createPostIt(postIt.position.x, postIt.position.y);
    });
  } catch (error) {
    console.error('Error restoring post-its:', error);
  }
};

const initializeListeners = () => {
  if (isInitialized) return; // 이미 초기화되었다면 중복 실행 방지

  document.body.addEventListener('dragover', (event) => {
    if (!isDraggable) return;
    event.preventDefault();
    event.stopPropagation();
  });

  document.body.addEventListener('drop', (event) => {
    if (!isDraggable) return;
    event.preventDefault();
    event.stopPropagation();

    createPostIt(event.pageX, event.pageY);
    isDraggable = false; // 드래그 상태 초기화
    document.body.removeAttribute('draggable');
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'dragStart') {
      isDraggable = true;
      document.body.setAttribute('draggable', 'true');
      sendResponse();
      return true;
    }
  });

  isInitialized = true; // 초기화 완료 표시
};

// 초기화 및 복원 실행
initializeListeners();
restorePostIts();
