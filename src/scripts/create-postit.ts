import { PostItData } from '../types/post-it';
import { PostItPage } from '../types/post-it-page';
import { generatePostItId } from '../util/generatePostItId';

export const createPostIt = (x: number, y: number, id?: string, isRestoring: boolean = false) => {
  const container = document.createElement('div');
  const postItId = id || `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  container.dataset.postItId = postItId;
  container.className = 'post-it-container';
  container.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      display: flex;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      z-index: 9999;
    `;

  // 포스트잇 생성
  const postIt = document.createElement('div');
  postIt.className = 'post-it';
  postIt.style.cssText = `
      width: 40px;
      height: 16px;
      background-color: #fef08a;
      border-radius: 4px;
      cursor: move;
    `;

  // 닫기 버튼 생성
  const closeButton = document.createElement('button');
  closeButton.className = 'post-it-close-button';
  closeButton.style.cssText = `
      width: 16px;
      height: 16px;
      background-color: #ef4444;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    `;

  // 호버 효과
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.opacity = '1';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.opacity = '0.8';
  });

  // 클릭 시 전체 컨테이너 제거 및 저장소에서 삭제
  closeButton.addEventListener('click', () => {
    // DOM에서 제거
    container.remove();
    
    // 저장소에서 삭제 및 사이드패널 갱신을 위한 메시지 전송
    chrome.runtime.sendMessage({
      type: 'deletePostIt',
      postItData: {
        id: postItId,
        url: document.location.href
      }
    });
  });

  // 포스트잇 클릭 이벤트 추가
  container.addEventListener('click', (event) => {
    // 클릭 이벤트가 닫기 버튼에서 발생한 경우 무시
    if (event.target === closeButton) return;

    chrome.runtime.sendMessage({
      type: 'selectPostIt',
      postItData: {
        id: postItId,
        url: document.location.href
      }
    });
  });

  // 요소들을 컨테이너에 추가
  container.appendChild(postIt);
  container.appendChild(closeButton);
  document.body.appendChild(container);

  // 복원 중이 아닐 때만 저장 실행
  if (!isRestoring && !id) {
    savePostIt(`${postItId}`, x, y);
  }
};

const savePostIt = (id: string, x: number, y: number) => {
  chrome.runtime.sendMessage({
    type: 'savePostIt',
    postItData: {
      id,
      url: document.location.href,
      position: { x, y },
      createdAt: Date.now(),
    },
  });
};

const removePostIt = (keys: string | string[]) => {
  chrome.storage.local.remove(keys, () => {
    console.log('Post-it removed:', keys);
  });
};
