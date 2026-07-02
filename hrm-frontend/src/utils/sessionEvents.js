const listeners = new Set();

export const emitSessionExpired = (reason) => {
  listeners.forEach((cb) => cb(reason));
};

export const onSessionExpired = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};