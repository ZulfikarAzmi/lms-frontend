import React from "react";

const VideoPlayer = ({ videoUrl, title }) => {
  // Fungsi untuk mendapatkan YouTube video ID
  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Fungsi untuk mendapatkan Vimeo video ID
  const getVimeoVideoId = (url) => {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Render YouTube embed
  const renderYouTubeEmbed = (videoId) => (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full rounded-lg"
    ></iframe>
  );

  // Render Vimeo embed
  const renderVimeoEmbed = (videoId) => (
    <iframe
      src={`https://player.vimeo.com/video/${videoId}`}
      title={title}
      frameBorder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className="w-full h-full rounded-lg"
    ></iframe>
  );

  // Render generic video player
  const renderGenericVideo = (url) => (
    <video controls className="w-full h-full rounded-lg" title={title}>
      <source src={url} type="video/mp4" />
      <source src={url} type="video/webm" />
      <source src={url} type="video/ogg" />
      Browser Anda tidak mendukung tag video.
    </video>
  );

  // Render video berdasarkan URL
  const renderVideo = () => {
    if (!videoUrl) {
      return (
        <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">URL video tidak tersedia</p>
        </div>
      );
    }

    const youtubeId = getYouTubeVideoId(videoUrl);
    if (youtubeId) {
      return renderYouTubeEmbed(youtubeId);
    }

    const vimeoId = getVimeoVideoId(videoUrl);
    if (vimeoId) {
      return renderVimeoEmbed(vimeoId);
    }

    return renderGenericVideo(videoUrl);
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      {renderVideo()}
    </div>
  );
};

export default VideoPlayer;
