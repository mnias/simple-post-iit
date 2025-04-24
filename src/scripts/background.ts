// 메시지 전달과 같은 이벤트를 처리하기 위해 백그라운드에서 실행되는 스크립트
chrome.sidePanel
  .setPanelBehavior({
    openPanelOnActionClick: true,
  })
  .catch((error) => {
    console.error('Error setting panel behavior:', error);
  });
