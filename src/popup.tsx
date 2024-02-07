import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Avatar, Rating, Artboard, Stats } from "react-daisyui";
import { GithubProfile, MessageType } from "./types";
import './tailwind.css';

type Repository = {
  repository: string;
  favicon: string;
};

const Popup = () => {
  const [rating, setRating] = useState(0)
  const [profile, setProfile] = useState() as [GithubProfile, (value: GithubProfile) => void];
  const [repository, setRepository] = useState() as [Repository, (value?: Repository) => void];

  useEffect(() => {
    chrome.runtime.sendMessage({
      type: MessageType.GetProfile,
    }, (data) => {
      setProfile(data);
    });

    chrome.storage.sync.get(
      { ratingValue: 5 },
      (items) => {
        setRating(items.ratingValue);
      }
    );
  }, []);

  const saveOptions = (value: number) => {
    setRating(value);
    chrome.storage.sync.set(
      { ratingValue: value },
      () => {},
    );
  };

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    const tab = tabs[0];

    if (!tab || !tab.url) {
      return setRepository();
    }
    const repoUrl = new URL(tab.url);
    // we consider only github repositories
    if (repoUrl.hostname !== 'github.com') {
      return setRepository();
    }
    setRepository({
      repository: repoUrl.pathname.replace('/', ''),
      favicon: tab.favIconUrl ? tab.favIconUrl : '',
    });
  });

  return (
    <>
      <div>
        <Artboard horizontal={true} size={1}>
          <div className={'m-7'}>
            <div className={'m-3'}>
              {profile && (
                <Avatar
                  color={'primary'}
                  shape={'circle'}
                  border={true}
                  borderColor={'secondary'}
                  src={profile?.avatar_url}
                  innerClassName={'rounded'}
                  size={'xs'} />
              )}
            </div>
            {repository && (
              <>
                <div className={'text-2xl font-bold'}>
                  {repository.favicon && <img src={repository.favicon} alt={'icon'} />}{repository.repository}
                </div>
                <Rating value={rating} onChange={(value) => saveOptions(value)}>
                  <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                  <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                  <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                  <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                  <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                </Rating>
              </>
            )}
          </div>
        </Artboard>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
