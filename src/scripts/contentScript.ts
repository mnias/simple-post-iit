// 웹 페이지에 삽입되어 확장 프로그램이 페이지의 콘텐츠와 상호작용되는 부분
import { createPostIt } from './create-postit';

let isDraggable = false;

document.body.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.body.addEventListener('drop', (event) => {
  if (!isDraggable) return;
  event.preventDefault();
  event.stopPropagation();
  createPostIt(event.pageX, event.pageY);

  document.body.removeAttribute('draggable');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'dragStart') {
    document.body.setAttribute('draggable', 'true');
    isDraggable = true;
    sendResponse();
    return true;
  }
});
