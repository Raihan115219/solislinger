import { createStore } from './createStore';

export interface Notice {
  id: number;
  text: string;
  tone: 'info' | 'error';
}

export const noticeStore = createStore<Notice | null>(null);

let seq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export function showNotice(text: string, tone: Notice['tone'] = 'info') {
  const id = ++seq;
  noticeStore.set({ id, text, tone });
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (noticeStore.get()?.id === id) noticeStore.set(null);
  }, 4500);
}
