import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [asciiArt, setAsciiArt] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.play();
    }
  };

  const convertToAscii = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    let ascii = '';
    const asciiChars = '@%#*+=-:. ';

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      const charIndex = Math.floor((avg / 255) * (asciiChars.length - 1));
      ascii += asciiChars[charIndex];
      if ((i / 4 + 1) % width === 0) {
        ascii += '\n';
      }
    }
    return ascii;
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const drawFrame = () => {
      context.drawImage(video, 0, 0, width, height);
      const ascii = convertToAscii(context, width, height);
      setAsciiArt(ascii);
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  useEffect(() => {
    const video = videoRef.current;
    video.addEventListener('play', handleVideoPlay);
    return () => {
      video.removeEventListener('play', handleVideoPlay);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl text-center mb-4">Video to ASCII Converter</h1>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <pre className="mt-4 whitespace-pre-wrap text-xs">{asciiArt}</pre>
    </div>
  );
};

export default Index;