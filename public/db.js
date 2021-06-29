let db;
let budgetVersion;

// create our new datebase request
const request = indexedDB.open('Online-Offline-Budget-Trackers', budgetVersion || 32);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('check db invoked');

  // Start our new transaction
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  // access our budgestore
  const store = transaction.objectStore('BudgetStore');

  // Get all from our budgetstore
  const getAll = store.getAll();

  // if on success
  getAll.onsuccess = function () {
    // if there are already items we need to add them
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // if not empty add
          if (res.length !== 0) {
            transaction = db.transaction(['BudgetStore'], 'readwrite');
            const currentStore = transaction.objectStore('BudgetStore');
            currentStore.clear();
      
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success!');
  db = e.target.result;

  // checking to see if we are connected
  if (navigator.onLine) {
    console.log('Connected!');
    checkDatabase();
  }
};

const saveRecord = (record) => {


  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  //adding to our store
  store.add(record);
};

// checking to see if we are back online
window.addEventListener('online', checkDatabase);