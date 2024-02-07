import { MessageType } from "./types";

console.debug('[RepoRater-Chrome::content_script]: injected!');

const el = document.querySelector('.starring-container div.unstarred');
if (el) {
  el.addEventListener('click', () => {
    const url = window.location.href;
    chrome.runtime.sendMessage({
      type: MessageType.RateRepo,
      payload: {
        url,
      },
    });
  });
}
