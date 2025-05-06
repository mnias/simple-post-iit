// 메시지 전달과 같은 이벤트를 처리하기 위해 백그라운드에서 실행되는 스크립트

// Where we will expose all the data we retrieve from storage.sync.
const storageCache = { count: 0 };
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = chrome.storage.sync.get().then((items) => {
  // Copy the data retrieved from storage into storageCache.
  Object.assign(storageCache, items);
});

chrome.sidePanel
  .setPanelBehavior({
    openPanelOnActionClick: true,
  })
  .then(async () => {
    try {
      await initStorageCache;
    } catch (e) {
      // Handle error that occurred during storage initialization.
    }

    // Normal action handler logic.
    storageCache.count++;
    // storageCache.lastTabId = tab.id;
    chrome.storage.sync.set(storageCache);
  })
  .catch((error) => {
    console.error('Error setting panel behavior:', error);
  });

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, namespace);
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`,
    );
  }
});
