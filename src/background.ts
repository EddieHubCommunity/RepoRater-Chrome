import { GithubProfile, MessageType } from "./types";

const appwriteHost = 'https://appwrite.repo-rating.eddiehub.io';
const appwriteProjectId = '6583c9dfe7f4f4a7e0b4';
const repoRaterHost = 'https://repo-rater.eddiehub.io';

let profile: GithubProfile | null = null;

const appwriteRequest = async (uri: string, method: string, body: any = null) => {
  const resp = await fetch(`${appwriteHost}${uri}`, {
    headers: {
      'content-type': 'application/json',
      'x-appwrite-project': appwriteProjectId,
      'x-appwrite-response-format': '1.4.0',
      'x-fallback-cookies': '',
      'x-sdk-language': 'web',
      'x-sdk-name': 'Web',
      'x-sdk-platform': 'client',
      'x-sdk-version': '13.0.1'
    },
    referrer: repoRaterHost,
    referrerPolicy: 'strict-origin-when-cross-origin',
    method: method,
    mode: 'cors',
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : undefined)
  });
  return await resp.json();
};

interface SessionModel {
  $createdAt: string;
  $id: string;
  clientCode: string;
  clientEngine: string;
  clientEngineVersion: string;
  clientName: string;
  clientType: string;
  clientVersion: string;
  countryCode: string;
  countryName: string;
  current: boolean;
  deviceBrand: string;
  deviceModel: string;
  deviceName: string;
  expire: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  provider: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: string;
  providerRefreshToken: string;
  providerUid: string;
  userId: string;
}

const getSession = async (): Promise<SessionModel> => {
  return appwriteRequest('/v1/account/sessions/current', 'GET');
};

const getJWT = async () => {
  return appwriteRequest('/v1/account/jwt', 'POST', {});
};

const getGithubProfile = async (token: string): Promise<GithubProfile> => {
  const response = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

const rateRepo = async (url: string, rating: number) => {
  let user;
  let jwt;
  try {
    user = await getSession();
    console.debug('[RepoRater-Chrome::background]: user', user);
    jwt = await getJWT();
    console.debug('[RepoRater-Chrome::background]: jwt', jwt);
  } catch (e) {
    console.error('[RepoRater-Chrome::background]: error', e);
    return;
  }

  const res = await fetch("https://repo-rater.eddiehub.io/api/rate", {
    method: "POST",
    body: JSON.stringify({
      rating,
      url,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt.jwt,
      SessionID: user.$id,
    },
  });

  return await res.json();
}


chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  console.debug('[RepoRater-Chrome::background]: Receive message', msg);
  switch (msg.type) {
    case MessageType.RateRepo:
      chrome.storage.sync.get(
        { ratingValue: 5 },
        async ({ ratingValue }) => {
          console.debug('[RepoRater-Chrome::background]: ratingValue ', ratingValue);
          const res = await rateRepo(msg.payload.url, ratingValue);
          sendResponse(res);
        }
      );
      break;
    case MessageType.GetProfile:
      sendResponse(profile);
      break;
  }
});

(async () => {
  const user = await getSession();
  if (user) {
    const { providerAccessToken } = user;
    profile = await getGithubProfile(providerAccessToken);
  }
})();

console.debug('[RepoRater-Chrome::background]: injected!');

function polling() {
  setTimeout(polling, 1000 * 30);
}

polling();
