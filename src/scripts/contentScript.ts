// 웹 페이지에 삽입되어 확장 프로그램이 페이지의 콘텐츠와 상호작용되는 부분
import { createPostIt } from './create-postit';

console.log('content script..');

let isDraggable = false;

document.body.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.body.addEventListener('drop', (event) => {
  if (!isDraggable) return;
  event.preventDefault();
  event.stopPropagation();
  console.log(event.pageX, event.pageY);

  createPostIt(event.pageX, event.pageY);

  document.body.removeAttribute('draggable');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender);
  console.log(message);
  if (message.type === 'dragStart') {
    console.log('Post-it started! on content script!!!!!!');
    document.body.setAttribute('draggable', 'true');
    isDraggable = true;
    sendResponse();
    return true;
  }
});
