// 웹 페이지에 삽입되어 확장 프로그램이 페이지의 콘텐츠와 상호작용되는 부분
import { PostItData } from '../types/post-it';
import { getPostIts } from '../util/storage';
import { createPostIt } from './create-postit';

let isDraggable = false;
let isInitialized = false;
let isRestoringPostIts = false; // 복원 중인지 확인하는 플래그 추가

const clearPostIts = () => {
  // 기존 포스트잇 제거
  const existingPostIts = document.querySelectorAll('[data-post-it-id]');
  existingPostIts.forEach((postIt) => postIt.remove());
};
const restorePostIts = async () => {
  if (isRestoringPostIts) return; // 이미 복원 중이면 중복 실행 방지
  
  try {
    isRestoringPostIts = true;
    const currentUrl = window.location.href;
    const savedPostIts = await getPostIts(currentUrl);

    console.log('Restoring post-its for:', currentUrl);
    console.log('Found post-its:', savedPostIts);

    // 기존 포스트잇 제거 후 새로운 포스트잇 생성
    clearPostIts();
    savedPostIts.forEach((postIt: PostItData) => {
      createPostIt(postIt.position.x, postIt.position.y, postIt.id, true); // isRestoring 플래그 추가
    });
  } catch (error) {
    console.error('Error restoring post-its:', error);
  } finally {
    isRestoringPostIts = false;
  }
};

// URL 변경 감지
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('URL changed, updating post-its');
    restorePostIts();
  }
});

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

// 초기화 및 이벤트 리스너 설정
const initialize = () => {
  if (isInitialized) return;

  initializeListeners();
  restorePostIts();

  // URL 변경 감지 시작
  urlObserver.observe(document, { subtree: true, childList: true });

  // 히스토리 API 이벤트 처리
  window.addEventListener('popstate', restorePostIts);

  isInitialized = true;
};

initialize();
