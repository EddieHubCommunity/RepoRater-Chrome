import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Avatar, Rating, Artboard } from "react-daisyui";
import { GithubProfile, MessageType } from "./types";
import './tailwind.css';

const Popup = () => {
  const [rating, setRating] = useState(0)
  const [profile, setProfile] = useState() as [GithubProfile, (value: GithubProfile) => void];

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

  return (
    <>
      <div>
        <Artboard horizontal={true} size={1}>
          {profile && (
            <div className="flex ">
              <div className="flex-none">
                <Avatar
                  color={'primary'}
                  shape={'circle'}
                  border={true}
                  borderColor={'secondary'}
                  src={profile?.avatar_url}
                  innerClassName={'rounded'}
                  size={'xs'} />
              </div>
              <div className="flex-1 w-64 p-[8px] text-sm">
                <span>{profile?.login}</span>
              </div>
            </div>
          )}
          <div className="flex ">
            <div className="flex-none p-[8px] text-sm">
              Default Rating
            </div>
            <div className="flex-1 w-64">
              <Rating value={rating} onChange={(value) => saveOptions(value)}>
                <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
                <Rating.Item name="rating-4" className="mask mask-star-2 bg-green-500" />
              </Rating>
            </div>
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
