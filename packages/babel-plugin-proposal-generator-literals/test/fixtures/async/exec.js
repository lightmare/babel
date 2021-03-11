async function asyncFail() {
  await new Promise(setImmediate);
  throw Error('AsyncFailure');
}

async function asyncSucceed() {}

function syncFail() {
  throw Error('SyncFailure');
}

async function asyncTest() {
// Change `*[' to `[' to see the unhandled rejection warning or error:
// (node:13393) UnhandledPromiseRejectionWarning: Error: AsyncFailure
  return Promise.all(
    *[ 
      asyncFail(),
      asyncSucceed(syncFail())
    ]
  );
}

expect(asyncTest()).rejects.toThrow('SyncFailure');

