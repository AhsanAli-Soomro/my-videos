'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { VideosContext } from '@/app/contexts/VideoContext';
import Link from 'next/link';
import RealTimeViews from '@/app/components/RealTimeViews';
import VideoPlayer from '@/app/components/VideoPlayer';

export default function VideoPage() {
  const { id } = useParams();
  const { videos, incrementViews } = useContext(VideosContext);
  const videoIndex = parseInt(id, 10); 
  const video = videos[videoIndex];
  const hasIncremented = useRef(false);

  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (video) {
      const savedPlayTime = localStorage.getItem(`playTime-${video.id}`);
      if (savedPlayTime) {
        setTotalPlayTime(parseInt(savedPlayTime, 10));
      }

      const savedViews = localStorage.getItem(`views-${video.id}`);
      if (savedViews) {
        setViews(parseInt(savedViews, 10));
      }
    }
  }, [video]);

  const handlePlay = () => {
    if (!hasIncremented.current && video) {
      incrementViews(videoIndex);
      hasIncremented.current = true;
      const currentViews = localStorage.getItem(`views-${video.id}`);
      const newViews = currentViews ? parseInt(currentViews, 10) + 1 : 1;
      localStorage.setItem(`views-${video.id}`, newViews.toString());
      setViews(newViews);
      const now = new Date();
      const newEntry = { x: now, y: newViews };
      const viewData = localStorage.getItem(`viewData-${video.id}`);
      const updatedData = viewData ? [...JSON.parse(viewData), newEntry] : [newEntry];
      localStorage.setItem(`viewData-${video.id}`, JSON.stringify(updatedData));
    }
  };

  const handleTimeUpdate = (elapsedTime) => {
    setTotalPlayTime((prevTime) => {
      const newTime = prevTime + elapsedTime;
      localStorage.setItem(`playTime-${video.id}`, newTime.toString());
      return newTime;
    });
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-3/5 lg:w-2/3">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{video.title}</h1>
          <div className="mb-4">
            <VideoPlayer video={video} onPlay={handlePlay} onTimeUpdate={handleTimeUpdate} />
          </div>
          <p className="text-gray-600 mb-4">{video.description}</p>
          <RealTimeViews views={views} />
          <div className="font-bold">
            Total Play Time: {Math.floor(totalPlayTime / 60)}m {Math.floor(totalPlayTime % 60)}s
          </div>
          <Link href="/" className="text-blue-500 hover:underline mt-4 block">
            Back to Home
          </Link>
        </div>
        <div className="w-full md:w-2/5 lg:w-1/3 mt-8 md:mt-0 md:ml-6">
          {Array.isArray(videos) && videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={index} className="border flex flex-col cursor-pointer rounded-lg p-4 mb-4 overflow-hidden">
                <Link href={`/video/${index}`} className="flex flex-col md:flex-row no-underline">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-52 md:h-48 object-cover mb-4 md:mb-0 md:mr-4 rounded" />
                  <div className="flex w-44 justify-center flex-col">
                    <h2 className="text-lg md:text-xl font-semibold line-clamp-1">{video.title}</h2>
                    <p className="line-clamp-2 text-ellipsis overflow-hidden">{video.description}</p>
                    <p className="line-clamp-2 text-ellipsis overflow-hidden">{video.author}</p>
                    <p className="line-clamp-2 text-ellipsis overflow-hidden">Views: {video.views}</p>
                    <p className="line-clamp-2 text-ellipsis overflow-hidden">Duration: {video.duration}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>{console.Console(video.title)}Loading videos...</p>
          )}
        </div>
      </div>
    </div>
  );
}
